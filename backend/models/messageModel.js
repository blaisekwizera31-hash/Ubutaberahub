/**
 * models/messageModel.js
 * Controls communication metadata, secure room states, and file-sharing
 * streams for end-to-end encrypted chat.
 *
 * Tables:
 *   conversations            — chat room metadata + case linkage
 *   conversation_participants — room membership, unread counts, role labels
 *   messages                 — individual message bodies
 *   message_attachments      — file-sharing records per message
 */

import { supabaseAdmin } from "../config/supabase.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeConversation(row, extras = {}) {
  return {
    id:          row.id,
    subject:     row.subject     || "",
    caseId:      row.case_id     || null,
    createdBy:   row.created_by  || null,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at  || row.created_at,
    // Enriched by query helpers below
    contact:     extras.contact     || null,
    contactId:   extras.contactId   || null,
    contactRole: extras.contactRole || null,
    unread:      extras.unread      ?? 0,
    lastMessage: extras.lastMessage || null,
    lastMessageAt: extras.lastMessageAt || row.updated_at || row.created_at,
    online:      false,
  };
}

function normalizeMessage(row, extras = {}) {
  return {
    id:             row.id,
    conversationId: row.conversation_id,
    senderId:       row.sender_id,
    senderName:     extras.senderName || null,
    body:           row.body          || "",
    hasAttachment:  extras.hasAttachment ?? false,
    attachments:    extras.attachments  || [],
    createdAt:      row.created_at,
    isOwn:          extras.isOwn ?? false,
  };
}

function missing(err, table) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes(table) && m.includes("does not exist");
}

// ── Participant helpers ───────────────────────────────────────────────────────

/**
 * isParticipant — Returns true if the user is a member of the conversation.
 */
export async function isParticipant(conversationId, userId, db = supabaseAdmin) {
  if (!db) return false;
  const { data, error } = await db
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  return !error && !!data;
}

/**
 * addParticipants — Insert participant rows for a new conversation.
 *
 * @param {string} conversationId
 * @param {Array<{ userId, role, unreadCount? }>} participants
 */
export async function addParticipants(conversationId, participants, db = supabaseAdmin) {
  if (!db) throw new Error("[messageModel.addParticipants] Supabase not configured");
  const rows = participants.map((p) => ({
    conversation_id: conversationId,
    user_id:         p.userId,
    role:            p.role         || "participant",
    unread_count:    p.unreadCount  ?? 0,
  }));
  const { error } = await db.from("conversation_participants").insert(rows);
  if (error) throw new Error(`[messageModel.addParticipants] ${error.message}`);
}

/**
 * incrementUnread — Bump unread_count for all participants except the sender.
 */
export async function incrementUnread(conversationId, excludeUserId, db = supabaseAdmin) {
  if (!db) return;
  const { data: others } = await db
    .from("conversation_participants")
    .select("id, unread_count")
    .eq("conversation_id", conversationId)
    .neq("user_id", excludeUserId);

  for (const p of others || []) {
    await db
      .from("conversation_participants")
      .update({ unread_count: Number(p.unread_count || 0) + 1 })
      .eq("id", p.id);
  }
}

/**
 * clearUnread — Reset unread_count to 0 for a specific user in a conversation.
 */
export async function clearUnread(conversationId, userId, db = supabaseAdmin) {
  if (!db) return;
  await db
    .from("conversation_participants")
    .update({ unread_count: 0 })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
}

// ── Conversation queries ──────────────────────────────────────────────────────

/**
 * findConversationById — Fetch conversation metadata.
 */
export async function findConversationById(id, db = supabaseAdmin) {
  if (!db || !id) return null;
  const { data, error } = await db
    .from("conversations").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`[messageModel.findConversationById] ${error.message}`);
  return data ? normalizeConversation(data) : null;
}

/**
 * findExistingConversation — Check if a conversation already exists between two users,
 * optionally scoped to a case. Returns conversation ID or null.
 *
 * @param {string} userId
 * @param {string} peerId
 * @param {string|null} caseId
 */
export async function findExistingConversation(userId, peerId, caseId = null, db = supabaseAdmin) {
  if (!db) return null;

  const { data: myRows } = await db
    .from("conversation_participants").select("conversation_id").eq("user_id", userId);
  const myIds = (myRows || []).map((r) => r.conversation_id);
  if (!myIds.length) return null;

  const { data: peerRows } = await db
    .from("conversation_participants").select("conversation_id").eq("user_id", peerId)
    .in("conversation_id", myIds);
  if (!peerRows?.length) return null;

  const sharedIds = peerRows.map((r) => r.conversation_id);

  if (caseId) {
    const { data: caseConvs } = await db
      .from("conversations").select("id").eq("case_id", caseId).in("id", sharedIds);
    return caseConvs?.[0]?.id || sharedIds[0];
  }
  return sharedIds[0];
}

/**
 * listConversationsForUser — Full conversation list for the sidebar, enriched
 * with peer name, unread count, and last message snippet.
 *
 * @param {string} userId
 */
export async function listConversationsForUser(userId, db = supabaseAdmin) {
  if (!db || !userId) return [];

  const { data: participantRows, error: pErr } = await db
    .from("conversation_participants").select("conversation_id, unread_count").eq("user_id", userId);
  if (pErr) throw new Error(`[messageModel.listConversationsForUser] ${pErr.message}`);

  const ids = (participantRows || []).map((r) => r.conversation_id);
  if (!ids.length) return [];

  const { data: convs, error: cErr } = await db.from("conversations").select("*").in("id", ids);
  if (cErr) throw new Error(`[messageModel.listConversationsForUser] ${cErr.message}`);

  const { data: peers } = await db
    .from("conversation_participants").select("conversation_id, user_id, role")
    .in("conversation_id", ids).neq("user_id", userId);

  const peerIds = [...new Set((peers || []).map((r) => r.user_id).filter(Boolean))];
  const { data: profiles } = peerIds.length
    ? await db.from("users").select("id, name, email, role").in("id", peerIds)
    : { data: [] };
  const peerById = new Map((profiles || []).map((p) => [p.id, p]));

  const { data: msgs } = await db
    .from("messages").select("id, conversation_id, body, created_at, sender_id")
    .in("conversation_id", ids).order("created_at", { ascending: false }).limit(500);

  const latestMsg  = new Map();
  for (const m of msgs || [])
    if (!latestMsg.has(m.conversation_id)) latestMsg.set(m.conversation_id, m);

  const unreadMap  = new Map((participantRows || []).map((r) => [r.conversation_id, r.unread_count || 0]));
  const peerByConv = new Map();
  for (const r of peers || []) if (!peerByConv.has(r.conversation_id)) peerByConv.set(r.conversation_id, r);

  return (convs || [])
    .map((c) => {
      const peer    = peerByConv.get(c.id);
      const profile = peer ? peerById.get(peer.user_id) : null;
      const latest  = latestMsg.get(c.id);
      return normalizeConversation(c, {
        contact:       profile?.name || profile?.email?.split("@")[0] || "Contact",
        contactId:     profile?.id   || null,
        contactRole:   profile?.role || peer?.role || "user",
        unread:        unreadMap.get(c.id) || 0,
        lastMessage:   latest?.body || "",
        lastMessageAt: latest?.created_at || c.updated_at || c.created_at,
      });
    })
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
}

/**
 * createConversation — Insert a new conversation + participants in one transaction.
 *
 * @param {{ subject, caseId?, createdBy }} convPayload
 * @param {Array<{ userId, role }>} participants
 */
export async function createConversation(convPayload, participants, db = supabaseAdmin) {
  if (!db) throw new Error("[messageModel.createConversation] Supabase not configured");

  const { data: conv, error } = await db
    .from("conversations")
    .insert([{
      subject:    convPayload.subject,
      case_id:    convPayload.caseId    || null,
      created_by: convPayload.createdBy || null,
    }])
    .select("*")
    .single();
  if (error) throw new Error(`[messageModel.createConversation] ${error.message}`);

  await addParticipants(conv.id, participants, db);
  return normalizeConversation(conv);
}

// ── Message queries ───────────────────────────────────────────────────────────

/**
 * listMessages — Paginated message list for a conversation.
 * Clears the caller's unread counter as a side-effect.
 *
 * @param {string} conversationId
 * @param {string} callerId        User reading the messages (for isOwn flag)
 * @param {{ limit?, offset? }} opts
 */
export async function listMessages(conversationId, callerId, opts = {}, db = supabaseAdmin) {
  if (!db) return [];
  const { limit = 100, offset = 0 } = opts;

  const { data: rows, error } = await db
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    if (missing(error, "messages")) return [];
    throw new Error(`[messageModel.listMessages] ${error.message}`);
  }

  const senderIds = [...new Set((rows || []).map((m) => m.sender_id).filter(Boolean))];
  const { data: senders } = senderIds.length
    ? await db.from("users").select("id, name, email").in("id", senderIds)
    : { data: [] };
  const senderById = new Map((senders || []).map((u) => [u.id, u]));

  // Clear unread for caller
  await clearUnread(conversationId, callerId, db);

  return (rows || []).map((m) => {
    const s = senderById.get(m.sender_id);
    return normalizeMessage(m, {
      senderName: s?.name || s?.email?.split("@")[0] || "User",
      isOwn:      m.sender_id === callerId,
    });
  });
}

/**
 * sendMessage — Insert a message, bump unread for peers.
 *
 * @param {{ conversationId, senderId, body }} payload
 */
export async function sendMessage(payload, db = supabaseAdmin) {
  if (!db) throw new Error("[messageModel.sendMessage] Supabase not configured");

  const { data, error } = await db
    .from("messages")
    .insert([{
      conversation_id: payload.conversationId,
      sender_id:       payload.senderId,
      body:            payload.body,
    }])
    .select("id, conversation_id, sender_id, body, created_at")
    .single();

  if (error) throw new Error(`[messageModel.sendMessage] ${error.message}`);

  await incrementUnread(payload.conversationId, payload.senderId, db);

  return normalizeMessage(data, { isOwn: true });
}

// ── File attachments ──────────────────────────────────────────────────────────

/**
 * attachFile — Record a file attachment on an existing message.
 *
 * @param {{ messageId, conversationId, uploadedBy, fileName, fileUrl, fileType, fileSizeBytes }} payload
 */
export async function attachFile(payload, db = supabaseAdmin) {
  if (!db) throw new Error("[messageModel.attachFile] Supabase not configured");

  const { data, error } = await db
    .from("message_attachments")
    .insert([{
      message_id:      payload.messageId,
      conversation_id: payload.conversationId,
      uploaded_by:     payload.uploadedBy,
      file_name:       payload.fileName,
      file_url:        payload.fileUrl,
      file_type:       payload.fileType       || "document",
      file_size_bytes: payload.fileSizeBytes  || 0,
      uploaded_at:     new Date().toISOString(),
    }])
    .select("*")
    .single();

  if (error) {
    if (missing(error, "message_attachments")) return null; // table not yet created
    throw new Error(`[messageModel.attachFile] ${error.message}`);
  }
  return data;
}

/**
 * listAttachments — All attachments for a conversation, newest first.
 */
export async function listAttachments(conversationId, db = supabaseAdmin) {
  if (!db) return [];
  const { data, error } = await db
    .from("message_attachments")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    if (missing(error, "message_attachments")) return [];
    throw new Error(`[messageModel.listAttachments] ${error.message}`);
  }
  return data || [];
}

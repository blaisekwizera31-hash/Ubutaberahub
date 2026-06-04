/**
 * controllers/messageController.js
 */

import { supabaseAdmin } from "../models/supabase.js";
import { getMessagesByRole } from "../models/dataStore.js";
import { fetchMessagesByRoleFromDb } from "../models/supabaseStore.js";

async function isParticipant(conversationId, userId) {
  if (!supabaseAdmin) return false;
  const { data, error } = await supabaseAdmin
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  return !error && !!data;
}

function missingNotificationsTable(err) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes("notifications") && m.includes("does not exist");
}

async function notify({ userId, type, title, body, metadata = {} }) {
  if (!supabaseAdmin || !userId) return;
  const { error } = await supabaseAdmin.from("notifications").insert([{
    user_id: userId, type: type || "general", title: title || "Notification",
    body: body || "", metadata, is_read: false,
  }]);
  if (error && !missingNotificationsTable(error))
    console.error("Notification error:", error.message);
}

export async function getMessagesByRoleHandler(req, res) {
  const role   = req.params.role;
  const fromDb = await fetchMessagesByRoleFromDb(supabaseAdmin, role);
  return res.json({ conversations: fromDb || getMessagesByRole(role) });
}

export async function getConversations(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
    const { id: userId } = req.user;

    const { data: participantRows, error: pErr } = await supabaseAdmin
      .from("conversation_participants").select("conversation_id, unread_count").eq("user_id", userId);
    if (pErr) return res.status(500).json({ error: "Failed to load conversations", message: pErr.message });

    const ids = (participantRows || []).map((r) => r.conversation_id);
    if (!ids.length) return res.json({ conversations: [] });

    const { data: convs, error: cErr } = await supabaseAdmin
      .from("conversations").select("*").in("id", ids);
    if (cErr) return res.status(500).json({ error: "Failed to load conversations", message: cErr.message });

    const { data: peers, error: peErr } = await supabaseAdmin
      .from("conversation_participants").select("conversation_id, user_id, role")
      .in("conversation_id", ids).neq("user_id", userId);
    if (peErr) return res.status(500).json({ error: "Failed to load participants", message: peErr.message });

    const peerIds = [...new Set((peers || []).map((r) => r.user_id).filter(Boolean))];
    const { data: profiles } = peerIds.length
      ? await supabaseAdmin.from("users").select("id, name, email, role").in("id", peerIds)
      : { data: [] };
    const peerById = new Map((profiles || []).map((p) => [p.id, p]));

    const { data: msgs } = await supabaseAdmin
      .from("messages").select("id, conversation_id, body, created_at, sender_id")
      .in("conversation_id", ids).order("created_at", { ascending: false }).limit(500);

    const latestMsg  = new Map();
    for (const m of msgs || [])
      if (!latestMsg.has(m.conversation_id)) latestMsg.set(m.conversation_id, m);

    const unreadMap  = new Map((participantRows || []).map((r) => [r.conversation_id, r.unread_count || 0]));
    const peerByConv = new Map();
    for (const r of peers || [])
      if (!peerByConv.has(r.conversation_id)) peerByConv.set(r.conversation_id, r);

    const payload = (convs || []).map((c) => {
      const peer    = peerByConv.get(c.id);
      const profile = peer ? peerById.get(peer.user_id) : null;
      const latest  = latestMsg.get(c.id);
      return {
        id:            c.id,
        subject:       c.subject,
        caseId:        c.case_id || null,
        updatedAt:     latest?.created_at || c.updated_at || c.created_at,
        unread:        unreadMap.get(c.id) || 0,
        contact:       profile?.name || profile?.email?.split("@")[0] || "Contact",
        contactId:     profile?.id || null,
        role:          profile?.role || peer?.role || "user",
        lastMessage:   latest?.body || "",
        lastMessageAt: latest?.created_at || c.updated_at || c.created_at,
        online:        false,
      };
    }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    return res.json({ conversations: payload });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load conversations", message: err.message });
  }
}

export async function getMessages(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
    const { conversationId } = req.params;
    const { id: userId } = req.user;

    if (!(await isParticipant(conversationId, userId)))
      return res.status(403).json({ error: "Forbidden" });

    const { data: rows, error } = await supabaseAdmin
      .from("messages").select("id, conversation_id, sender_id, body, created_at")
      .eq("conversation_id", conversationId).order("created_at", { ascending: true });
    if (error) return res.status(500).json({ error: "Failed to load messages", message: error.message });

    const senderIds = [...new Set((rows || []).map((m) => m.sender_id).filter(Boolean))];
    const { data: senders } = senderIds.length
      ? await supabaseAdmin.from("users").select("id, name, email").in("id", senderIds)
      : { data: [] };
    const senderById = new Map((senders || []).map((u) => [u.id, u]));

    await supabaseAdmin.from("conversation_participants")
      .update({ unread_count: 0 })
      .eq("conversation_id", conversationId).eq("user_id", userId);

    return res.json({
      messages: (rows || []).map((m) => {
        const s = senderById.get(m.sender_id);
        return {
          id:             m.id,
          conversationId: m.conversation_id,
          senderId:       m.sender_id,
          senderName:     s?.name || s?.email?.split("@")[0] || "User",
          body:           m.body,
          createdAt:      m.created_at,
          isOwn:          m.sender_id === userId,
        };
      }),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load messages", message: err.message });
  }
}

export async function sendMessage(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
    const { conversationId } = req.params;
    const { id: userId } = req.user;
    const body = req.body.body;

    if (!(await isParticipant(conversationId, userId)))
      return res.status(403).json({ error: "Forbidden" });

    const { data: inserted, error } = await supabaseAdmin
      .from("messages").insert([{ conversation_id: conversationId, sender_id: userId, body }])
      .select("id, conversation_id, sender_id, body, created_at").single();
    if (error) return res.status(500).json({ error: "Failed to send message", message: error.message });

    const { data: others } = await supabaseAdmin
      .from("conversation_participants").select("id, user_id, unread_count")
      .eq("conversation_id", conversationId).neq("user_id", userId);

    for (const p of others || []) {
      await supabaseAdmin.from("conversation_participants")
        .update({ unread_count: Number(p.unread_count || 0) + 1 }).eq("id", p.id);
      await notify({
        userId: p.user_id, type: "new_message", title: "New Message", body,
        metadata: { conversationId, messageId: inserted.id, fromUserId: userId },
      });
    }

    await supabaseAdmin.from("conversation_participants")
      .update({ unread_count: 0 })
      .eq("conversation_id", conversationId).eq("user_id", userId);

    return res.status(201).json({
      message: {
        id:             inserted.id,
        conversationId: inserted.conversation_id,
        senderId:       inserted.sender_id,
        body:           inserted.body,
        createdAt:      inserted.created_at,
        isOwn:          true,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to send message", message: err.message });
  }
}

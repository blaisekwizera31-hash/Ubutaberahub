/**
 * models/messageModel.js
 * Controls communication metadata, secure room states, and file-sharing
 * streams for end-to-end encrypted chat using PostgreSQL.
 */

import pool from "../config/db.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeConversation(row, extras = {}) {
  if (!row) return null;
  return {
    id:          row.id,
    subject:     row.subject     || "",
    caseId:      row.case_id     || null,
    createdBy:   row.created_by  || null,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at  || row.created_at,
    contact:     extras.contact     || null,
    contactId:   extras.contactId   || null,
    contactPhoto: extras.contactPhoto || null,
    contactEmail: extras.contactEmail || null,
    contactPhone: extras.contactPhone || null,
    contactRole: extras.contactRole || null,
    unread:      extras.unread      ?? 0,
    lastMessage: extras.lastMessage || null,
    lastMessageAt: extras.lastMessageAt || row.updated_at || row.created_at,
    online:      false,
  };
}

function normalizeMessage(row, extras = {}) {
  if (!row) return null;
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

// ── Participant helpers ───────────────────────────────────────────────────────

/**
 * isParticipant — Returns true if the user is a member of the conversation.
 */
export async function isParticipant(conversationId, userId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  return rows.length > 0;
}

/**
 * addParticipants — Insert participant rows for a new conversation.
 */
export async function addParticipants(conversationId, participants) {
  for (const p of participants) {
    await pool.query(
      'INSERT INTO conversation_participants (conversation_id, user_id, role, unread_count) VALUES ($1, $2, $3, $4)',
      [conversationId, p.userId, p.role || "participant", p.unreadCount ?? 0]
    );
  }
}

/**
 * incrementUnread — Bump unread_count for all participants except the sender.
 */
export async function incrementUnread(conversationId, excludeUserId) {
  await pool.query(
    'UPDATE conversation_participants SET unread_count = unread_count + 1 WHERE conversation_id = $1 AND user_id != $2',
    [conversationId, excludeUserId]
  );
}

/**
 * clearUnread — Reset unread_count to 0 for a specific user in a conversation.
 */
export async function clearUnread(conversationId, userId) {
  await pool.query(
    'UPDATE conversation_participants SET unread_count = 0 WHERE conversation_id = $1 AND user_id = $2',
    [conversationId, userId]
  );
}

// ── Conversation queries ──────────────────────────────────────────────────────

/**
 * findConversationById — Fetch conversation metadata.
 */
export async function findConversationById(id) {
  const { rows } = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
  return normalizeConversation(rows[0]);
}

/**
 * findExistingConversation — Check if a conversation already exists between two users.
 */
export async function findExistingConversation(userId, peerId, caseId = null) {
  let query = `
    SELECT cp1.conversation_id 
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    JOIN conversations c ON c.id = cp1.conversation_id
    WHERE cp1.user_id = $1 AND cp2.user_id = $2
  `;
  const values = [userId, peerId];

  if (caseId) {
    query += ' AND c.case_id = $3';
    values.push(caseId);
  }

  const { rows } = await pool.query(query, values);
  return rows[0]?.conversation_id || null;
}

/**
 * listConversationsForUser — Full conversation list for the sidebar.
 */
export async function listConversationsForUser(userId) {
  const query = `
    SELECT 
      c.*, 
      cp.unread_count as unread,
      peer.user_id as contact_id,
      u.name as contact_name,
      u.email as contact_email,
      u.phone as contact_phone,
      u.profile_photo as contact_photo,
      u.role as contact_role,
      m.body as last_message_body,
      m.created_at as last_message_at
    FROM conversations c
    JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $1
    LEFT JOIN conversation_participants peer ON peer.conversation_id = c.id AND peer.user_id != $1
    LEFT JOIN users u ON u.id = peer.user_id
    LEFT JOIN LATERAL (
      SELECT body, created_at 
      FROM messages 
      WHERE conversation_id = c.id 
      ORDER BY created_at DESC 
      LIMIT 1
    ) m ON TRUE
    ORDER BY COALESCE(m.created_at, c.created_at) DESC
  `;
  
  const { rows } = await pool.query(query, [userId]);
  
  return rows.map(r => normalizeConversation(r, {
    contact:       r.contact_name || r.contact_email?.split("@")[0] || "Contact",
    contactId:     r.contact_id,
    contactPhoto:   r.contact_photo || null,
    contactEmail:   r.contact_email || null,
    contactPhone:   r.contact_phone || null,
    contactRole:   r.contact_role,
    unread:        r.unread || 0,
    lastMessage:   r.last_message_body || "",
    lastMessageAt: r.last_message_at || r.updated_at || r.created_at
  }));
}

/**
 * createConversation — Insert a new conversation + participants.
 */
export async function createConversation(convPayload, participants) {
  const { rows: convRows } = await pool.query(
    'INSERT INTO conversations (subject, case_id, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
    [convPayload.subject, convPayload.caseId || null, convPayload.createdBy || null]
  );
  const conv = convRows[0];
  await addParticipants(conv.id, participants);
  return normalizeConversation(conv);
}

// ── Message queries ───────────────────────────────────────────────────────────

/**
 * listMessages — Paginated message list for a conversation.
 */
export async function listMessages(conversationId, callerId, opts = {}) {
  const { limit = 100, offset = 0 } = opts;

  const query = `
    SELECT m.*, u.name as sender_name, u.email as sender_email
    FROM messages m
    LEFT JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = $1
    ORDER BY m.created_at ASC
    LIMIT $2 OFFSET $3
  `;
  
  const { rows } = await pool.query(query, [conversationId, limit, offset]);

  // Clear unread for caller
  await clearUnread(conversationId, callerId);

  return rows.map((m) => normalizeMessage(m, {
    senderName: m.sender_name || m.sender_email?.split("@")[0] || "User",
    isOwn:      m.sender_id === callerId,
  }));
}

/**
 * sendMessage — Insert a message, bump unread for peers.
 */
export async function sendMessage(payload) {
  const { rows } = await pool.query(
    'INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
    [payload.conversationId, payload.senderId, payload.body]
  );
  
  await incrementUnread(payload.conversationId, payload.senderId);
  return normalizeMessage(rows[0], { isOwn: true });
}

// ── File attachments ──────────────────────────────────────────────────────────

/**
 * attachFile — Record a file attachment on an existing message.
 */
export async function attachFile(payload) {
  const query = `
    INSERT INTO message_attachments (
      message_id, conversation_id, uploaded_by, file_name, file_url, file_type, file_size_bytes, uploaded_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
  `;
  const values = [
    payload.messageId, payload.conversationId, payload.uploadedBy, 
    payload.fileName, payload.fileUrl, payload.fileType || "document", 
    payload.fileSizeBytes || 0
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * listAttachments — All attachments for a conversation, newest first.
 */
export async function listAttachments(conversationId) {
  const { rows } = await pool.query(
    'SELECT * FROM message_attachments WHERE conversation_id = $1 ORDER BY uploaded_at DESC',
    [conversationId]
  );
  return rows;
}

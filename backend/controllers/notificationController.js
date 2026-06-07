/**
 * controllers/notificationController.js
 */

import pool from "../config/db.js";

export async function getNotifications(req, res) {
  try {
    const { rows } = await pool.query(
      "SELECT id, type, title, body, metadata, is_read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );

    const notifications = rows.map((n) => ({
      id:        n.id,
      type:      n.type      || "general",
      title:     n.title     || "Notification",
      body:      n.body      || "",
      metadata:  n.metadata  || {},
      isRead:    !!n.is_read,
      createdAt: n.created_at,
    }));

    return res.json({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load notifications", message: err.message });
  }
}

export async function markRead(req, res) {
  try {
    const notificationId = req.body?.notificationId ? String(req.body.notificationId) : null;
    const markAll        = !!req.body?.markAll;

    let query = "UPDATE notifications SET is_read = true WHERE user_id = $1";
    const values = [req.user.id];

    if (!markAll && notificationId) {
      query += " AND id = $2";
      values.push(notificationId);
    }

    await pool.query(query, values);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update notifications", message: err.message });
  }
}

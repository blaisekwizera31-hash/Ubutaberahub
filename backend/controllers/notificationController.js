/**
 * controllers/notificationController.js
 */

import { supabaseAdmin } from "../config/supabase.js";

function missingTable(err) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes("notifications") && m.includes("does not exist");
}

export async function getNotifications(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("id, type, title, body, metadata, is_read, created_at")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      if (missingTable(error)) return res.json({ notifications: [], unreadCount: 0 });
      return res.status(500).json({ error: "Failed to load notifications", message: error.message });
    }

    const notifications = (data || []).map((n) => ({
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
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const notificationId = req.body?.notificationId ? String(req.body.notificationId) : null;
    const markAll        = !!req.body?.markAll;

    let query = supabaseAdmin.from("notifications").update({ is_read: true }).eq("user_id", req.user.id);
    if (!markAll && notificationId) query = query.eq("id", notificationId);

    const { error } = await query;
    if (error) {
      if (missingTable(error)) return res.json({ ok: true });
      return res.status(500).json({ error: "Failed to update notifications", message: error.message });
    }
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update notifications", message: err.message });
  }
}

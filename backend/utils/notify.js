/**
 * utils/notify.js
 * Single shared notification helper used by all controllers.
 * Inserts a row into the `notifications` table via PostgreSQL.
 */

import pool from "../config/db.js";

/**
 * notify — Insert a notification record for a user.
 */
export async function notify({ userId, type, title, body, metadata = {} }) {
  if (!userId) return;

  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, title, body, metadata, is_read, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [userId, type || "general", title || "Notification", body || "", metadata, false]
    );
  } catch (err) {
    console.error("[notify] Failed to insert notification:", err.message);
  }
}

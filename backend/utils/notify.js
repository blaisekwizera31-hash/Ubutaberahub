/**
 * utils/notify.js
 * Single shared notification helper used by all controllers.
 * Inserts a row into the `notifications` table via supabaseAdmin.
 * Silently skips if the table doesn't exist yet (pre-migration safety).
 */

import { supabaseAdmin } from "../config/supabase.js";
import { isTableMissing } from "./dbErrors.js";

/**
 * notify — Insert a notification record for a user.
 *
 * @param {{
 *   userId:    string,
 *   type?:     string,   e.g. "case_update" | "appointment_request" | "hearing_scheduled"
 *   title:     string,
 *   body:      string,
 *   metadata?: object
 * }} params
 * @param {object} [db]  Optional supabase client override (for testing)
 */
export async function notify({ userId, type, title, body, metadata = {} }, db = supabaseAdmin) {
  if (!db || !userId) return;

  const { error } = await db.from("notifications").insert([{
    user_id:  userId,
    type:     type    || "general",
    title:    title   || "Notification",
    body:     body    || "",
    metadata,
    is_read:  false,
  }]);

  if (error && !isTableMissing(error, "notifications")) {
    console.error("[notify] Failed to insert notification:", error.message);
  }
}

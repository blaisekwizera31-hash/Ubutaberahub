/**
 * utils/dbErrors.js
 * Shared Supabase error detection helpers used across controllers and models.
 */

/**
 * isTableMissing — Returns true when the Supabase error indicates a table
 * does not exist yet (graceful degradation before migrations run).
 *
 * @param {object} err    Supabase error object
 * @param {string} table  Table name to check for (e.g. "notifications")
 */
export function isTableMissing(err, table = "") {
  const m = String(err?.message || "").toLowerCase();
  const missing = m.includes("does not exist") || m.includes("relation") || m.includes("undefined table");
  return table ? (m.includes(table.toLowerCase()) && missing) : missing;
}

/**
 * isConflict — Returns true for unique constraint violations.
 */
export function isConflict(err) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes("duplicate") || m.includes("unique") || (err?.code === "23505");
}

/**
 * isForeignKeyViolation — Returns true when a referenced row doesn't exist.
 */
export function isForeignKeyViolation(err) {
  return err?.code === "23503";
}

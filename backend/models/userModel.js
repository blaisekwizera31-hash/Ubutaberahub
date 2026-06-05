/**
 * models/userModel.js
 * Manages registration, profiles, and role-based portal access
 * for citizens, lawyers, clerks, and judges.
 *
 * All functions accept a `db` (supabaseAdmin) instance so they remain
 * testable and decoupled from the singleton import.
 */

import { supabaseAdmin } from "../config/supabase.js";

// ── Constants ─────────────────────────────────────────────────────────────────

export const ROLES = Object.freeze(["citizen", "lawyer", "clerk", "judge"]);

/** Columns exposed publicly (no sensitive internals) */
const PUBLIC_COLS = "id, email, name, role, profile_photo, created_at, updated_at";

/** Columns exposed for lawyer directory listings */
const LAWYER_COLS =
  "id, email, name, role, profile_photo, specialization, years_experience, " +
  "law_firm, license_number, is_verified, verification_status, created_at";

// ── Helpers ───────────────────────────────────────────────────────────────────

export function safeRole(v) {
  return ROLES.includes(v) ? v : "citizen";
}

function missingTable(err) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes("users") && m.includes("does not exist");
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * findById — Fetch a full user profile by UUID.
 * Returns null when not found.
 */
export async function findById(id, db = supabaseAdmin) {
  if (!db || !id) return null;
  const { data, error } = await db.from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`[userModel.findById] ${error.message}`);
  return data || null;
}

/**
 * findByEmail — Fetch a user profile by email address.
 */
export async function findByEmail(email, db = supabaseAdmin) {
  if (!db || !email) return null;
  const { data, error } = await db
    .from("users").select("*").eq("email", email).maybeSingle();
  if (error) throw new Error(`[userModel.findByEmail] ${error.message}`);
  return data || null;
}

/**
 * upsertProfile — Create or update a user profile row.
 * Used on first login and when syncing OAuth metadata.
 *
 * @param {{ id, email, name, role, profile_photo }} payload
 */
export async function upsertProfile(payload, db = supabaseAdmin) {
  if (!db) throw new Error("[userModel.upsertProfile] Supabase not configured");

  const safe = {
    id:            payload.id,
    email:         payload.email,
    name:          payload.name          || payload.email?.split("@")[0] || "User",
    role:          safeRole(payload.role),
    profile_photo: payload.profile_photo || null,
    updated_at:    new Date().toISOString(),
  };

  const { data, error } = await db
    .from("users")
    .upsert([safe], { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw new Error(`[userModel.upsertProfile] ${error.message}`);
  return data;
}

/**
 * updateProfile — Partial update for name, photo, or role.
 * Role changes are validated against ROLES enum.
 */
export async function updateProfile(id, updates, db = supabaseAdmin) {
  if (!db) throw new Error("[userModel.updateProfile] Supabase not configured");

  const allowed = {};
  if (updates.name          !== undefined) allowed.name          = String(updates.name).trim().slice(0, 120);
  if (updates.profile_photo !== undefined) allowed.profile_photo = updates.profile_photo;
  if (updates.role          !== undefined) allowed.role          = safeRole(updates.role);
  if (updates.law_firm      !== undefined) allowed.law_firm      = String(updates.law_firm).trim().slice(0, 200);
  if (updates.specialization !== undefined) allowed.specialization = updates.specialization;
  if (updates.years_experience !== undefined) allowed.years_experience = Number(updates.years_experience) || 0;
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await db
    .from("users").update(allowed).eq("id", id).select("*").single();
  if (error) throw new Error(`[userModel.updateProfile] ${error.message}`);
  return data;
}

/**
 * listByRole — Return all users with a specific role.
 * Used by admin/analytics and lawyer directory.
 *
 * @param {'citizen'|'lawyer'|'clerk'|'judge'} role
 * @param {{ limit?, offset?, verified? }} opts
 */
export async function listByRole(role, opts = {}, db = supabaseAdmin) {
  if (!db) return [];
  const { limit = 100, offset = 0, verified } = opts;
  const cols = role === "lawyer" ? LAWYER_COLS : PUBLIC_COLS;

  let q = db
    .from("users")
    .select(cols)
    .eq("role", role)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (verified !== undefined) q = q.eq("is_verified", !!verified);

  const { data, error } = await q;
  if (error) {
    if (missingTable(error)) return [];
    throw new Error(`[userModel.listByRole] ${error.message}`);
  }
  return data || [];
}

/**
 * countByRole — Returns { citizen, lawyer, clerk, judge } counts.
 * Used by analyticsController.
 */
export async function countByRole(db = supabaseAdmin) {
  if (!db) return {};
  const { data, error } = await db.from("users").select("role");
  if (error) {
    if (missingTable(error)) return {};
    throw new Error(`[userModel.countByRole] ${error.message}`);
  }
  return (data || []).reduce((acc, r) => {
    acc[r.role] = (acc[r.role] || 0) + 1;
    return acc;
  }, {});
}

/**
 * verifyLawyer — Set lawyer verification status.
 * Clerk / judge action.
 */
export async function verifyLawyer(lawyerId, approved, db = supabaseAdmin) {
  if (!db) throw new Error("[userModel.verifyLawyer] Supabase not configured");
  const { data, error } = await db
    .from("users")
    .update({
      is_verified:          approved,
      verification_status:  approved ? "verified" : "rejected",
      approved_at:          approved ? new Date().toISOString() : null,
      updated_at:           new Date().toISOString(),
    })
    .eq("id", lawyerId)
    .eq("role", "lawyer")
    .select("*")
    .single();
  if (error) throw new Error(`[userModel.verifyLawyer] ${error.message}`);
  return data;
}

/**
 * deleteUser — Hard-delete a user record.
 * Use with caution — cascades must be set on the DB side.
 */
export async function deleteUser(id, db = supabaseAdmin) {
  if (!db) throw new Error("[userModel.deleteUser] Supabase not configured");
  const { error } = await db.from("users").delete().eq("id", id);
  if (error) throw new Error(`[userModel.deleteUser] ${error.message}`);
  return true;
}

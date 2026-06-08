/**
 * models/userModel.js
 * Manages registration, profiles, and role-based portal access
 * for citizens, lawyers, clerks, and judges using PostgreSQL.
 */

import pool from "../config/db.js";

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

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * findById — Fetch a full user profile by UUID.
 */
export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * findByEmail — Fetch a user profile by email address.
 */
export async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

/**
 * upsertProfile — Create or update a user profile row.
 */
export async function upsertProfile(payload) {
  const safe = {
    id:            payload.id,
    email:         payload.email,
    name:          payload.name          || payload.email?.split("@")[0] || "User",
    role:          safeRole(payload.role),
    profile_photo: payload.profile_photo || null,
  };

  const query = `
    INSERT INTO users (id, email, name, role, profile_photo, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      profile_photo = EXCLUDED.profile_photo,
      updated_at = NOW()
    RETURNING *
  `;
  
  const { rows } = await pool.query(query, [safe.id, safe.email, safe.name, safe.role, safe.profile_photo]);
  return rows[0];
}

/**
 * updateProfile — Partial update for name, photo, or role.
 */
export async function updateProfile(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(String(updates.name).trim().slice(0, 120));
  }
  if (updates.profile_photo !== undefined) {
    fields.push(`profile_photo = $${idx++}`);
    values.push(updates.profile_photo);
  }
  if (updates.phone !== undefined) {
    fields.push(`phone = $${idx++}`);
    values.push(String(updates.phone || "").trim().slice(0, 50));
  }
  if (updates.role !== undefined) {
    fields.push(`role = $${idx++}`);
    values.push(safeRole(updates.role));
  }
  if (updates.law_firm !== undefined) {
    fields.push(`law_firm = $${idx++}`);
    values.push(String(updates.law_firm).trim().slice(0, 200));
  }
  if (updates.specialization !== undefined) {
    fields.push(`specialization = $${idx++}`);
    values.push(updates.specialization);
  }
  if (updates.years_experience !== undefined) {
    fields.push(`years_experience = $${idx++}`);
    values.push(Number(updates.years_experience) || 0);
  }
  if (updates.hourly_rate !== undefined) {
    fields.push(`hourly_rate = $${idx++}`);
    values.push(Number(updates.hourly_rate) || 0);
  }
  if (updates.is_available !== undefined) {
    fields.push(`is_available = $${idx++}`);
    values.push(updates.is_available !== false);
  }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);
  
  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * listByRole — Return all users with a specific role.
 */
export async function listByRole(role, opts = {}) {
  const { limit = 100, offset = 0, verified } = opts;
  const cols = role === "lawyer" ? LAWYER_COLS : PUBLIC_COLS;

  let query = `SELECT ${cols} FROM users WHERE role = $1`;
  const values = [role];
  let idx = 2;

  if (verified !== undefined) {
    query += ` AND is_verified = $${idx++}`;
    values.push(!!verified);
  }

  query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows;
}

/**
 * countByRole — Returns { citizen, lawyer, clerk, judge } counts.
 */
export async function countByRole() {
  const { rows } = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
  return rows.reduce((acc, r) => {
    acc[r.role] = parseInt(r.count, 10);
    return acc;
  }, {});
}

/**
 * verifyLawyer — Set lawyer verification status.
 */
export async function verifyLawyer(lawyerId, approved) {
  const query = `
    UPDATE users 
    SET 
      is_verified = $1, 
      verification_status = $2, 
      approved_at = $3, 
      updated_at = NOW()
    WHERE id = $4 AND role = 'lawyer'
    RETURNING *
  `;
  const values = [
    approved,
    approved ? "verified" : "rejected",
    approved ? new Date().toISOString() : null,
    lawyerId
  ];
  
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * deleteUser — Hard-delete a user record.
 */
export async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return true;
}

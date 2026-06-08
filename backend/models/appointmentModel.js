/**
 * models/appointmentModel.js
 * Manages legal professional discovery filters, consultation calendar
 * bookings, and scheduling state transitions using PostgreSQL.
 */

import pool from "../config/db.js";

// ── Constants ─────────────────────────────────────────────────────────────────

export const APPOINTMENT_STATUSES = Object.freeze([
  "pending", "confirmed", "cancelled", "completed", "no_show",
]);

export const APPOINTMENT_TYPES = Object.freeze([
  "Consultation", "Case Review", "Document Signing",
  "Court Prep", "Follow-up", "Mediation", "Other",
]);

export const APPOINTMENT_MODES = Object.freeze(["video", "phone", "in_person"]);

// ── Helpers ───────────────────────────────────────────────────────────────────

export function safeStatus(v) {
  return APPOINTMENT_STATUSES.includes(v) ? v : "pending";
}

export function safeType(v) {
  return APPOINTMENT_TYPES.includes(v) ? v : "Consultation";
}

export function safeMode(v) {
  return APPOINTMENT_MODES.includes(v) ? v : "video";
}

function normalize(row) {
  if (!row) return null;
  const iso = row.starts_at ? new Date(row.starts_at) : new Date();
  return {
    id:             row.id,
    citizenId:      row.citizen_id      || null,
    lawyerId:       row.lawyer_id       || null,
    judgeId:        row.judge_id        || null,
    clerkId:        row.clerk_id        || null,
    caseId:         row.case_id         || null,
    type:           row.appointment_type || "Consultation",
    mode:           row.mode            || "video",
    status:         row.status          || "pending",
    startsAt:       row.starts_at,
    date:           iso.toISOString().slice(0, 10),
    time:           iso.toISOString().slice(11, 16),
    durationMins:   row.duration_minutes || 30,
    notes:          row.notes           || "",
    lawyerName:     row.metadata?.lawyer || null,
    lawyerAvailableTime: row.metadata?.available_time || "",
    bookedAt:       row.metadata?.booked_at || row.created_at,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * findById — Fetch a single appointment by UUID.
 */
export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
  return normalize(rows[0]);
}

/**
 * listForUser — Returns all appointments for a user across any participant role.
 */
export async function listForUser(userId, opts = {}) {
  const { limit = 100, offset = 0, status, from, to } = opts;

  let query = `
    SELECT * FROM appointments 
    WHERE (citizen_id = $1 OR lawyer_id = $1 OR judge_id = $1 OR clerk_id = $1)
  `;
  const values = [userId];
  let idx = 2;

  if (status && APPOINTMENT_STATUSES.includes(status)) {
    query += ` AND status = $${idx++}`;
    values.push(status);
  }
  if (from) {
    query += ` AND starts_at >= $${idx++}`;
    values.push(new Date(from).toISOString());
  }
  if (to) {
    query += ` AND starts_at <= $${idx++}`;
    values.push(new Date(to).toISOString());
  }

  query += ` ORDER BY starts_at ASC LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows.map(normalize);
}

/**
 * listByRole — Returns appointments scoped to user's role column.
 */
export async function listByRole(role, userId, opts = {}) {
  const colMap = { citizen: "citizen_id", lawyer: "lawyer_id", judge: "judge_id", clerk: "clerk_id" };
  const col = colMap[role] || "citizen_id";
  const { limit = 100, offset = 0 } = opts;

  const query = `SELECT * FROM appointments WHERE ${col} = $1 ORDER BY starts_at ASC LIMIT $2 OFFSET $3`;
  const { rows } = await pool.query(query, [userId, limit, offset]);
  return rows.map(normalize);
}

/**
 * create — Book a new appointment.
 */
export async function create(payload) {
  if (!payload.lawyerId) throw new Error("lawyerId is required");
  if (!payload.startsAt) throw new Error("startsAt is required");

  const row = {
    citizen_id:       payload.citizenId,
    lawyer_id:        payload.lawyerId,
    appointment_type: safeType(payload.appointmentType),
    starts_at:        new Date(payload.startsAt).toISOString(),
    duration_minutes: Number(payload.durationMinutes) || 30,
    mode:             safeMode(payload.mode),
    status:           "pending",
    case_id:          payload.caseId || null,
    notes:            payload.notes  || null,
    metadata: {
      lawyer:    payload.lawyerName || null,
      available_time: payload.lawyerAvailableTime || null,
      booked_at: new Date().toISOString(),
    },
  };

  const query = `
    INSERT INTO appointments (
      citizen_id, lawyer_id, appointment_type, starts_at, duration_minutes, 
      mode, status, case_id, notes, metadata, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    RETURNING *
  `;
  
  const values = [
    row.citizen_id, row.lawyer_id, row.appointment_type, row.starts_at, row.duration_minutes,
    row.mode, row.status, row.case_id, row.notes, row.metadata
  ];

  const { rows } = await pool.query(query, values);
  return normalize(rows[0]);
}

/**
 * updateStatus — Transition appointment to a new status.
 */
export async function updateStatus(id, status) {
  if (!APPOINTMENT_STATUSES.includes(status))
    throw new Error(`[appointmentModel.updateStatus] Invalid status: ${status}`);

  const { rows } = await pool.query(
    'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  return normalize(rows[0]);
}

/**
 * checkAvailability — Returns conflicting appointments for a lawyer in a time window.
 */
export async function checkAvailability(lawyerId, startsAt, durationMinutes = 30) {
  const start = new Date(startsAt).toISOString();
  const end   = new Date(new Date(startsAt).getTime() + durationMinutes * 60_000).toISOString();

  const query = `
    SELECT id, starts_at, duration_minutes, status 
    FROM appointments 
    WHERE lawyer_id = $1 AND status NOT IN ('cancelled', 'no_show')
    AND starts_at >= $2 AND starts_at < $3
  `;
  const { rows } = await pool.query(query, [lawyerId, start, end]);
  return rows;
}

/**
 * cancel — Soft-cancel an appointment with an optional reason note.
 */
export async function cancel(id, reason) {
  const { rows } = await pool.query(
    'UPDATE appointments SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    ["cancelled", reason ? `Cancelled: ${reason}` : "Cancelled", id]
  );
  return normalize(rows[0]);
}

/**
 * countUpcoming — Count upcoming confirmed/pending appointments for a user.
 */
export async function countUpcoming(userId) {
  const query = `
    SELECT COUNT(*) 
    FROM appointments 
    WHERE (citizen_id = $1 OR lawyer_id = $1)
    AND status IN ('pending', 'confirmed')
    AND starts_at >= NOW()
  `;
  const { rows } = await pool.query(query, [userId]);
  return parseInt(rows[0].count, 10);
}

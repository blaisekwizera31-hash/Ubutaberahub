/**
 * models/appointmentModel.js
 * Manages legal professional discovery filters, consultation calendar
 * bookings, and scheduling state transitions.
 *
 * Table: appointments
 * Related: users (lawyer, citizen), cases
 */

import { supabaseAdmin } from "../config/supabase.js";

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
    bookedAt:       row.metadata?.booked_at || row.created_at,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  };
}

function missingTable(err) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes("appointments") && m.includes("does not exist");
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * findById — Fetch a single appointment by UUID.
 */
export async function findById(id, db = supabaseAdmin) {
  if (!db || !id) return null;
  const { data, error } = await db
    .from("appointments").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`[appointmentModel.findById] ${error.message}`);
  return data ? normalize(data) : null;
}

/**
 * listForUser — Returns all appointments for a user across any participant role.
 *
 * @param {string} userId
 * @param {{ limit?, offset?, status?, from?, to? }} opts
 */
export async function listForUser(userId, opts = {}, db = supabaseAdmin) {
  if (!db || !userId) return [];
  const { limit = 100, offset = 0, status, from, to } = opts;

  let q = db
    .from("appointments")
    .select("*")
    .or([
      `citizen_id.eq.${userId}`,
      `lawyer_id.eq.${userId}`,
      `judge_id.eq.${userId}`,
      `clerk_id.eq.${userId}`,
    ].join(","))
    .order("starts_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (status && APPOINTMENT_STATUSES.includes(status)) q = q.eq("status", status);
  if (from) q = q.gte("starts_at", new Date(from).toISOString());
  if (to)   q = q.lte("starts_at", new Date(to).toISOString());

  const { data, error } = await q;
  if (error) {
    if (missingTable(error)) return [];
    throw new Error(`[appointmentModel.listForUser] ${error.message}`);
  }
  return (data || []).map(normalize);
}

/**
 * listByRole — Returns appointments scoped to user's role column.
 *
 * @param {'citizen'|'lawyer'|'judge'|'clerk'} role
 * @param {string} userId
 * @param {{ limit?, offset? }} opts
 */
export async function listByRole(role, userId, opts = {}, db = supabaseAdmin) {
  if (!db || !userId) return [];
  const colMap = { citizen: "citizen_id", lawyer: "lawyer_id", judge: "judge_id", clerk: "clerk_id" };
  const col = colMap[role] || "citizen_id";
  const { limit = 100, offset = 0 } = opts;

  const { data, error } = await db
    .from("appointments")
    .select("*")
    .eq(col, userId)
    .order("starts_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    if (missingTable(error)) return [];
    throw new Error(`[appointmentModel.listByRole] ${error.message}`);
  }
  return (data || []).map(normalize);
}

/**
 * create — Book a new appointment.
 *
 * @param {{ citizenId, lawyerId, appointmentType, startsAt, durationMinutes, mode, caseId, notes, lawyerName }} payload
 */
export async function create(payload, db = supabaseAdmin) {
  if (!db) throw new Error("[appointmentModel.create] Supabase not configured");

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
      booked_at: new Date().toISOString(),
    },
  };

  const { data, error } = await db.from("appointments").insert([row]).select("*").single();
  if (error) throw new Error(`[appointmentModel.create] ${error.message}`);
  return normalize(data);
}

/**
 * updateStatus — Transition appointment to a new status.
 */
export async function updateStatus(id, status, db = supabaseAdmin) {
  if (!db) throw new Error("[appointmentModel.updateStatus] Supabase not configured");
  if (!APPOINTMENT_STATUSES.includes(status))
    throw new Error(`[appointmentModel.updateStatus] Invalid status: ${status}`);

  const { data, error } = await db
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`[appointmentModel.updateStatus] ${error.message}`);
  return normalize(data);
}

/**
 * checkAvailability — Returns conflicting appointments for a lawyer in a time window.
 * Used to prevent double-booking before calling create().
 *
 * @param {string} lawyerId
 * @param {string} startsAt   ISO date string
 * @param {number} durationMinutes
 */
export async function checkAvailability(lawyerId, startsAt, durationMinutes = 30, db = supabaseAdmin) {
  if (!db) return [];
  const start = new Date(startsAt).toISOString();
  const end   = new Date(new Date(startsAt).getTime() + durationMinutes * 60_000).toISOString();

  const { data, error } = await db
    .from("appointments")
    .select("id, starts_at, duration_minutes, status")
    .eq("lawyer_id", lawyerId)
    .not("status", "in", '("cancelled","no_show")')
    .gte("starts_at", start)
    .lt("starts_at", end);

  if (error) return [];
  return data || [];
}

/**
 * cancel — Soft-cancel an appointment with an optional reason note.
 */
export async function cancel(id, reason, db = supabaseAdmin) {
  if (!db) throw new Error("[appointmentModel.cancel] Supabase not configured");
  const { data, error } = await db
    .from("appointments")
    .update({
      status:     "cancelled",
      notes:      reason ? `Cancelled: ${reason}` : "Cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`[appointmentModel.cancel] ${error.message}`);
  return normalize(data);
}

/**
 * countUpcoming — Count upcoming confirmed/pending appointments for a user.
 */
export async function countUpcoming(userId, db = supabaseAdmin) {
  if (!db) return 0;
  const now = new Date().toISOString();
  const { count, error } = await db
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .or(`citizen_id.eq.${userId},lawyer_id.eq.${userId}`)
    .in("status", ["pending", "confirmed"])
    .gte("starts_at", now);
  if (error) return 0;
  return count ?? 0;
}

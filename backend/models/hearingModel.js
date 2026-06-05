/**
 * models/hearingModel.js
 * Coordinates official court calendar dates, trial room assignments,
 * and specific judicial scheduling.
 *
 * Table: hearings
 * Related: cases, users (judge, clerk), notifications
 */

import { supabaseAdmin } from "../config/supabase.js";

// ── Constants ─────────────────────────────────────────────────────────────────

export const HEARING_STATUSES = Object.freeze([
  "scheduled", "in_progress", "adjourned", "completed", "cancelled",
]);

export const HEARING_TYPES = Object.freeze([
  "preliminary", "main", "appeal", "sentencing", "bail", "mention", "other",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

export function safeStatus(v) {
  return HEARING_STATUSES.includes(v) ? v : "scheduled";
}

export function safeType(v) {
  return HEARING_TYPES.includes(v) ? v : "other";
}

function normalize(row) {
  return {
    id:           row.id,
    caseId:       row.case_id,
    caseNumber:   row.metadata?.case_number || null,
    caseTitle:    row.metadata?.case_title  || null,
    type:         row.hearing_type          || "other",
    status:       row.status                || "scheduled",
    scheduledAt:  row.scheduled_at,
    durationMins: row.duration_minutes      || 60,
    roomId:       row.room_id               || null,
    roomName:     row.room_name             || null,
    judgeId:      row.judge_id              || null,
    judgeName:    row.metadata?.judge_name  || null,
    clerkId:      row.clerk_id              || null,
    notes:        row.notes                 || "",
    metadata:     row.metadata              || {},
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

function missingTable(err) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes("hearings") && m.includes("does not exist");
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * findById — Fetch a single hearing row.
 */
export async function findById(id, db = supabaseAdmin) {
  if (!db || !id) return null;
  const { data, error } = await db.from("hearings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`[hearingModel.findById] ${error.message}`);
  return data ? normalize(data) : null;
}

/**
 * listForCase — All hearings linked to a specific case UUID.
 *
 * @param {string} caseId
 * @param {{ status?, limit?, offset? }} opts
 */
export async function listForCase(caseId, opts = {}, db = supabaseAdmin) {
  if (!db || !caseId) return [];
  const { status, limit = 50, offset = 0 } = opts;

  let q = db
    .from("hearings")
    .select("*")
    .eq("case_id", caseId)
    .order("scheduled_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (status && HEARING_STATUSES.includes(status)) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) {
    if (missingTable(error)) return [];
    throw new Error(`[hearingModel.listForCase] ${error.message}`);
  }
  return (data || []).map(normalize);
}

/**
 * listForJudge — All hearings assigned to a specific judge.
 *
 * @param {string} judgeId
 * @param {{ from?, to?, status?, limit?, offset? }} opts
 */
export async function listForJudge(judgeId, opts = {}, db = supabaseAdmin) {
  if (!db || !judgeId) return [];
  const { from, to, status, limit = 100, offset = 0 } = opts;

  let q = db
    .from("hearings")
    .select("*")
    .eq("judge_id", judgeId)
    .order("scheduled_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (status && HEARING_STATUSES.includes(status)) q = q.eq("status", status);
  if (from) q = q.gte("scheduled_at", new Date(from).toISOString());
  if (to)   q = q.lte("scheduled_at", new Date(to).toISOString());

  const { data, error } = await q;
  if (error) {
    if (missingTable(error)) return [];
    throw new Error(`[hearingModel.listForJudge] ${error.message}`);
  }
  return (data || []).map(normalize);
}

/**
 * listForClerk — All hearings a clerk is assigned to manage.
 */
export async function listForClerk(clerkId, opts = {}, db = supabaseAdmin) {
  if (!db || !clerkId) return [];
  const { from, to, status, limit = 100, offset = 0 } = opts;

  let q = db
    .from("hearings")
    .select("*")
    .eq("clerk_id", clerkId)
    .order("scheduled_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (status && HEARING_STATUSES.includes(status)) q = q.eq("status", status);
  if (from) q = q.gte("scheduled_at", new Date(from).toISOString());
  if (to)   q = q.lte("scheduled_at", new Date(to).toISOString());

  const { data, error } = await q;
  if (error) {
    if (missingTable(error)) return [];
    throw new Error(`[hearingModel.listForClerk] ${error.message}`);
  }
  return (data || []).map(normalize);
}

/**
 * schedule — Insert a new hearing row.
 *
 * @param {{ caseId, hearingType, scheduledAt, durationMinutes, roomId, roomName, judgeId, clerkId, notes, metadata }} payload
 */
export async function schedule(payload, db = supabaseAdmin) {
  if (!db) throw new Error("[hearingModel.schedule] Supabase not configured");
  if (!payload.caseId)      throw new Error("caseId is required");
  if (!payload.scheduledAt) throw new Error("scheduledAt is required");
  if (!payload.judgeId)     throw new Error("judgeId is required");

  const row = {
    case_id:          payload.caseId,
    hearing_type:     safeType(payload.hearingType),
    status:           "scheduled",
    scheduled_at:     new Date(payload.scheduledAt).toISOString(),
    duration_minutes: Number(payload.durationMinutes) || 60,
    room_id:          payload.roomId   || null,
    room_name:        payload.roomName || null,
    judge_id:         payload.judgeId,
    clerk_id:         payload.clerkId  || null,
    notes:            payload.notes    || null,
    metadata:         payload.metadata || {},
  };

  const { data, error } = await db.from("hearings").insert([row]).select("*").single();
  if (error) throw new Error(`[hearingModel.schedule] ${error.message}`);
  return normalize(data);
}

/**
 * update — Partial update for rescheduling, room changes, or status updates.
 *
 * @param {string} id
 * @param {{ status?, scheduledAt?, durationMinutes?, roomId?, roomName?, judgeId?, clerkId?, notes? }} updates
 */
export async function update(id, updates, db = supabaseAdmin) {
  if (!db) throw new Error("[hearingModel.update] Supabase not configured");

  const allowed = {};
  if (updates.status          !== undefined) allowed.status           = safeStatus(updates.status);
  if (updates.scheduledAt     !== undefined) allowed.scheduled_at     = new Date(updates.scheduledAt).toISOString();
  if (updates.durationMinutes !== undefined) allowed.duration_minutes = Number(updates.durationMinutes);
  if (updates.roomId          !== undefined) allowed.room_id          = updates.roomId;
  if (updates.roomName        !== undefined) allowed.room_name        = updates.roomName;
  if (updates.judgeId         !== undefined) allowed.judge_id         = updates.judgeId;
  if (updates.clerkId         !== undefined) allowed.clerk_id         = updates.clerkId;
  if (updates.notes           !== undefined) allowed.notes            = updates.notes;
  allowed.updated_at = new Date().toISOString();

  if (Object.keys(allowed).length === 1) // only updated_at
    throw new Error("[hearingModel.update] No valid fields to update");

  const { data, error } = await db
    .from("hearings").update(allowed).eq("id", id).select("*").single();
  if (error) throw new Error(`[hearingModel.update] ${error.message}`);
  return normalize(data);
}

/**
 * cancel — Set status to cancelled with an optional reason.
 */
export async function cancel(id, reason, db = supabaseAdmin) {
  if (!db) throw new Error("[hearingModel.cancel] Supabase not configured");
  const { data, error } = await db
    .from("hearings")
    .update({
      status:     "cancelled",
      notes:      reason ? `Cancelled: ${reason}` : "Cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`[hearingModel.cancel] ${error.message}`);
  return normalize(data);
}

/**
 * checkRoomConflict — Returns conflicting hearings in the same room for a time window.
 * Call before schedule() to enforce room availability.
 *
 * @param {string}  roomId
 * @param {string}  scheduledAt    ISO date string
 * @param {number}  durationMinutes
 * @param {string}  [excludeId]    Hearing ID to exclude (for reschedule checks)
 */
export async function checkRoomConflict(roomId, scheduledAt, durationMinutes = 60, excludeId = null, db = supabaseAdmin) {
  if (!db || !roomId) return [];
  const start = new Date(scheduledAt).toISOString();
  const end   = new Date(new Date(scheduledAt).getTime() + durationMinutes * 60_000).toISOString();

  let q = db
    .from("hearings")
    .select("id, scheduled_at, duration_minutes, status")
    .eq("room_id", roomId)
    .neq("status", "cancelled")
    .gte("scheduled_at", start)
    .lt("scheduled_at", end);

  if (excludeId) q = q.neq("id", excludeId);

  const { data, error } = await q;
  if (error) return [];
  return data || [];
}

/**
 * listRooms — Distinct room list derived from hearing rows.
 * Optionally decorated with booked-slot counts within a date range.
 *
 * @param {{ from?, to? }} opts
 */
export async function listRooms(opts = {}, db = supabaseAdmin) {
  if (!db) return [];
  const { from, to } = opts;

  const { data, error } = await db
    .from("hearings")
    .select("room_id, room_name")
    .not("room_id", "is", null);

  if (error) {
    if (missingTable(error)) return [];
    throw new Error(`[hearingModel.listRooms] ${error.message}`);
  }

  // Deduplicate
  const map = new Map();
  for (const r of data || []) {
    if (r.room_id && !map.has(r.room_id))
      map.set(r.room_id, { id: r.room_id, name: r.room_name, bookedSlots: [] });
  }
  const rooms = [...map.values()];

  if (from && to && rooms.length) {
    const { data: booked } = await db
      .from("hearings")
      .select("room_id, scheduled_at, duration_minutes, status")
      .not("room_id", "is", null)
      .neq("status", "cancelled")
      .gte("scheduled_at", new Date(from).toISOString())
      .lte("scheduled_at", new Date(to).toISOString());

    const slotsByRoom = (booked || []).reduce((acc, r) => {
      if (!acc[r.room_id]) acc[r.room_id] = [];
      acc[r.room_id].push({
        scheduledAt:  r.scheduled_at,
        durationMins: r.duration_minutes,
        status:       r.status,
      });
      return acc;
    }, {});

    for (const room of rooms) room.bookedSlots = slotsByRoom[room.id] || [];
  }

  return rooms;
}

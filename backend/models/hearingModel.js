/**
 * models/hearingModel.js
 * Coordinates official court calendar dates, trial room assignments,
 * and specific judicial scheduling using PostgreSQL.
 */

import pool from "../config/db.js";

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
  if (!row) return null;
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

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * findById — Fetch a single hearing row.
 */
export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM hearings WHERE id = $1', [id]);
  return normalize(rows[0]);
}

/**
 * listForCase — All hearings linked to a specific case UUID.
 */
export async function listForCase(caseId, opts = {}) {
  const { status, limit = 50, offset = 0 } = opts;

  let query = 'SELECT * FROM hearings WHERE case_id = $1';
  const values = [caseId];
  let idx = 2;

  if (status && HEARING_STATUSES.includes(status)) {
    query += ` AND status = $${idx++}`;
    values.push(status);
  }

  query += ` ORDER BY scheduled_at ASC LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows.map(normalize);
}

/**
 * listForJudge — All hearings assigned to a specific judge.
 */
export async function listForJudge(judgeId, opts = {}) {
  const { from, to, status, limit = 100, offset = 0 } = opts;

  let query = 'SELECT * FROM hearings WHERE judge_id = $1';
  const values = [judgeId];
  let idx = 2;

  if (status && HEARING_STATUSES.includes(status)) {
    query += ` AND status = $${idx++}`;
    values.push(status);
  }
  if (from) {
    query += ` AND scheduled_at >= $${idx++}`;
    values.push(new Date(from).toISOString());
  }
  if (to) {
    query += ` AND scheduled_at <= $${idx++}`;
    values.push(new Date(to).toISOString());
  }

  query += ` ORDER BY scheduled_at ASC LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows.map(normalize);
}

/**
 * listForClerk — All hearings a clerk is assigned to manage.
 */
export async function listForClerk(clerkId, opts = {}) {
  const { from, to, status, limit = 100, offset = 0 } = opts;

  let query = 'SELECT * FROM hearings WHERE clerk_id = $1';
  const values = [clerkId];
  let idx = 2;

  if (status && HEARING_STATUSES.includes(status)) {
    query += ` AND status = $${idx++}`;
    values.push(status);
  }
  if (from) {
    query += ` AND scheduled_at >= $${idx++}`;
    values.push(new Date(from).toISOString());
  }
  if (to) {
    query += ` AND scheduled_at <= $${idx++}`;
    values.push(new Date(to).toISOString());
  }

  query += ` ORDER BY scheduled_at ASC LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows.map(normalize);
}

/**
 * schedule — Insert a new hearing row.
 */
export async function schedule(payload) {
  if (!payload.caseId)      throw new Error("caseId is required");
  if (!payload.scheduledAt) throw new Error("scheduledAt is required");
  if (!payload.judgeId)     throw new Error("judgeId is required");

  const query = `
    INSERT INTO hearings (
      case_id, hearing_type, status, scheduled_at, duration_minutes, 
      room_id, room_name, judge_id, clerk_id, notes, metadata, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING *
  `;
  const values = [
    payload.caseId, safeType(payload.hearingType), "scheduled", 
    new Date(payload.scheduledAt).toISOString(), Number(payload.durationMinutes) || 60,
    payload.roomId || null, payload.roomName || null, payload.judgeId, 
    payload.clerkId || null, payload.notes || null, payload.metadata || {}
  ];

  const { rows } = await pool.query(query, values);
  return normalize(rows[0]);
}

/**
 * update — Partial update for rescheduling, room changes, or status updates.
 */
export async function update(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(safeStatus(updates.status));
  }
  if (updates.scheduledAt !== undefined) {
    fields.push(`scheduled_at = $${idx++}`);
    values.push(new Date(updates.scheduledAt).toISOString());
  }
  if (updates.durationMinutes !== undefined) {
    fields.push(`duration_minutes = $${idx++}`);
    values.push(Number(updates.durationMinutes));
  }
  if (updates.roomId !== undefined) {
    fields.push(`room_id = $${idx++}`);
    values.push(updates.roomId);
  }
  if (updates.roomName !== undefined) {
    fields.push(`room_name = $${idx++}`);
    values.push(updates.roomName);
  }
  if (updates.judgeId !== undefined) {
    fields.push(`judge_id = $${idx++}`);
    values.push(updates.judgeId);
  }
  if (updates.clerkId !== undefined) {
    fields.push(`clerk_id = $${idx++}`);
    values.push(updates.clerkId);
  }
  if (updates.notes !== undefined) {
    fields.push(`notes = $${idx++}`);
    values.push(updates.notes);
  }

  if (fields.length === 0) throw new Error("[hearingModel.update] No valid fields to update");

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE hearings SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(query, values);
  return normalize(rows[0]);
}

/**
 * cancel — Set status to cancelled with an optional reason.
 */
export async function cancel(id, reason) {
  const { rows } = await pool.query(
    'UPDATE hearings SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    ["cancelled", reason ? `Cancelled: ${reason}` : "Cancelled", id]
  );
  return normalize(rows[0]);
}

/**
 * checkRoomConflict — Returns conflicting hearings in the same room for a time window.
 */
export async function checkRoomConflict(roomId, scheduledAt, durationMinutes = 60, excludeId = null) {
  const start = new Date(scheduledAt).toISOString();
  const end   = new Date(new Date(scheduledAt).getTime() + durationMinutes * 60_000).toISOString();

  let query = `
    SELECT id, scheduled_at, duration_minutes, status 
    FROM hearings 
    WHERE room_id = $1 AND status != 'cancelled'
    AND scheduled_at >= $2 AND scheduled_at < $3
  `;
  const values = [roomId, start, end];

  if (excludeId) {
    query += ' AND id != $4';
    values.push(excludeId);
  }

  const { rows } = await pool.query(query, values);
  return rows;
}

/**
 * listRooms — Distinct room list derived from hearing rows.
 */
export async function listRooms(opts = {}) {
  const { from, to } = opts;

  const { rows: roomRows } = await pool.query(
    'SELECT DISTINCT room_id, room_name FROM hearings WHERE room_id IS NOT NULL'
  );

  const rooms = roomRows.map(r => ({ id: r.room_id, name: r.room_name, bookedSlots: [] }));

  if (from && to && rooms.length) {
    const { rows: booked } = await pool.query(
      "SELECT room_id, scheduled_at, duration_minutes, status FROM hearings WHERE room_id IS NOT NULL AND status != 'cancelled' AND scheduled_at >= $1 AND scheduled_at <= $2",
      [new Date(from).toISOString(), new Date(to).toISOString()]
    );

    const slotsByRoom = booked.reduce((acc, r) => {
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

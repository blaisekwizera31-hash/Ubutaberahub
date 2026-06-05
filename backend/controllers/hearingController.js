/**
 * controllers/hearingController.js
 * Manages court hearing calendar dates, room scheduling, and judicial assignments.
 */

import { supabaseAdmin } from "../config/supabase.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_STATUSES = ["scheduled", "in_progress", "adjourned", "completed", "cancelled"];
const VALID_TYPES    = ["preliminary", "main", "appeal", "sentencing", "bail", "other"];

function safeStatus(v) { return VALID_STATUSES.includes(v) ? v : "scheduled"; }
function safeType(v)   { return VALID_TYPES.includes(v)    ? v : "other"; }

function normalizeHearing(row) {
  return {
    id:           row.id,
    caseId:       row.case_id,
    caseNumber:   row.case_number  || row.metadata?.case_number || null,
    caseTitle:    row.case_title   || row.metadata?.case_title  || null,
    type:         row.hearing_type || "other",
    status:       row.status       || "scheduled",
    scheduledAt:  row.scheduled_at,
    durationMins: row.duration_minutes || 60,
    room:         row.room_name    || null,
    roomId:       row.room_id      || null,
    judgeId:      row.judge_id     || null,
    judgeName:    row.metadata?.judge_name || null,
    clerkId:      row.clerk_id     || null,
    notes:        row.notes        || "",
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

function missingTable(err, tableName) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes(tableName) && m.includes("does not exist");
}

async function notify({ userId, type, title, body, metadata = {} }) {
  if (!supabaseAdmin || !userId) return;
  const { error } = await supabaseAdmin.from("notifications").insert([{
    user_id: userId, type: type || "general", title, body, metadata, is_read: false,
  }]);
  if (error && !missingTable(error, "notifications"))
    console.error("[hearingController] notify error:", error.message);
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/hearings
 * Returns hearings visible to the authenticated user based on their role.
 * - judge / clerk  → all hearings they are assigned to
 * - lawyer         → hearings for cases they are assigned to
 * - citizen        → hearings for their own cases
 * Query params: ?status=scheduled&from=ISO&to=ISO&caseId=uuid
 */
export async function getHearings(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const userId = req.user.id;
    const role   = req.profile?.role || "citizen";
    const { status, from, to, caseId, limit = 100, offset = 0 } = req.query;

    let query = supabaseAdmin.from("hearings").select("*").order("scheduled_at", { ascending: true });

    // Scope by role
    if (role === "judge") {
      query = query.eq("judge_id", userId);
    } else if (role === "clerk") {
      query = query.eq("clerk_id", userId);
    } else if (role === "lawyer") {
      // hearings whose case has this lawyer assigned
      const { data: cases } = await supabaseAdmin
        .from("cases").select("id").eq("assigned_lawyer_id", userId);
      const caseIds = (cases || []).map((c) => c.id);
      if (!caseIds.length) return res.json({ hearings: [] });
      query = query.in("case_id", caseIds);
    } else {
      // citizen
      const { data: cases } = await supabaseAdmin
        .from("cases").select("id").eq("citizen_id", userId);
      const caseIds = (cases || []).map((c) => c.id);
      if (!caseIds.length) return res.json({ hearings: [] });
      query = query.in("case_id", caseIds);
    }

    if (status && VALID_STATUSES.includes(status)) query = query.eq("status", status);
    if (caseId) query = query.eq("case_id", caseId);
    if (from)   query = query.gte("scheduled_at", new Date(from).toISOString());
    if (to)     query = query.lte("scheduled_at", new Date(to).toISOString());

    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error } = await query;
    if (error) {
      if (missingTable(error, "hearings"))
        return res.json({ hearings: [], note: "hearings table not yet created" });
      return res.status(500).json({ error: "Failed to load hearings", message: error.message });
    }

    return res.json({ hearings: (data || []).map(normalizeHearing) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load hearings", message: err.message });
  }
}

/**
 * GET /api/hearings/:id
 * Returns a single hearing by ID.
 */
export async function getHearingById(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const { data, error } = await supabaseAdmin
      .from("hearings").select("*").eq("id", req.params.id).maybeSingle();

    if (error) return res.status(500).json({ error: "Failed to load hearing", message: error.message });
    if (!data) return res.status(404).json({ error: "Hearing not found" });

    return res.json({ hearing: normalizeHearing(data) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load hearing", message: err.message });
  }
}

/**
 * POST /api/hearings
 * Schedule a new hearing. Restricted to clerk and judge roles.
 * Body: { caseId, hearingType, scheduledAt, durationMinutes, roomId, roomName, judgeId, clerkId, notes }
 */
export async function scheduleHearing(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const {
      caseId, hearingType, scheduledAt, durationMinutes,
      roomId, roomName, judgeId, clerkId, notes,
    } = req.body;

    if (!caseId)      return res.status(400).json({ error: "caseId is required" });
    if (!scheduledAt) return res.status(400).json({ error: "scheduledAt (ISO string) is required" });
    if (!judgeId)     return res.status(400).json({ error: "judgeId is required" });

    // Confirm the case exists
    const { data: caseRow } = await supabaseAdmin
      .from("cases").select("id, case_number, title, citizen_id, assigned_lawyer_id")
      .eq("id", caseId).maybeSingle();
    if (!caseRow) return res.status(400).json({ error: "Case not found" });

    // Check room availability (no overlapping hearings in same room)
    if (roomId) {
      const start  = new Date(scheduledAt).toISOString();
      const endMs  = new Date(scheduledAt).getTime() + (Number(durationMinutes) || 60) * 60_000;
      const end    = new Date(endMs).toISOString();

      const { data: conflicts } = await supabaseAdmin
        .from("hearings")
        .select("id, scheduled_at")
        .eq("room_id", roomId)
        .neq("status", "cancelled")
        .gte("scheduled_at", start)
        .lt("scheduled_at", end);

      if (conflicts?.length)
        return res.status(409).json({
          error:     "Room conflict",
          message:   `Room is already booked for ${conflicts.length} hearing(s) in that time slot.`,
          conflicts: conflicts.map((c) => ({ id: c.id, scheduledAt: c.scheduled_at })),
        });
    }

    const { data: hearing, error } = await supabaseAdmin
      .from("hearings")
      .insert([{
        case_id:          caseId,
        hearing_type:     safeType(hearingType),
        status:           "scheduled",
        scheduled_at:     new Date(scheduledAt).toISOString(),
        duration_minutes: Number(durationMinutes) || 60,
        room_id:          roomId   || null,
        room_name:        roomName || null,
        judge_id:         judgeId,
        clerk_id:         clerkId  || req.user.id,
        notes:            notes    || null,
        metadata: {
          case_number:  caseRow.case_number,
          case_title:   caseRow.title,
          scheduled_by: req.user.id,
          scheduled_at: new Date().toISOString(),
        },
      }])
      .select("*").single();

    if (error) return res.status(500).json({ error: "Failed to schedule hearing", message: error.message });

    // Notify relevant parties
    const notifyTargets = [caseRow.citizen_id, caseRow.assigned_lawyer_id, judgeId].filter(Boolean);
    await Promise.all(notifyTargets.map((uid) =>
      notify({
        userId:   uid,
        type:     "hearing_scheduled",
        title:    "Hearing Scheduled",
        body:     `A ${hearing.hearing_type} hearing for case ${caseRow.case_number || caseId} is scheduled on ${new Date(hearing.scheduled_at).toDateString()}.`,
        metadata: { hearingId: hearing.id, caseId, scheduledAt: hearing.scheduled_at },
      })
    ));

    return res.status(201).json({ hearing: normalizeHearing(hearing) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to schedule hearing", message: err.message });
  }
}

/**
 * PATCH /api/hearings/:id
 * Update hearing details (reschedule, change room, update status, etc.)
 * Restricted to clerk and judge.
 */
export async function updateHearing(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const { id } = req.params;
    const { status, scheduledAt, durationMinutes, roomId, roomName, judgeId, clerkId, notes } = req.body;

    const updates = {};
    if (status        !== undefined) updates.status           = safeStatus(status);
    if (scheduledAt   !== undefined) updates.scheduled_at     = new Date(scheduledAt).toISOString();
    if (durationMinutes !== undefined) updates.duration_minutes = Number(durationMinutes);
    if (roomId        !== undefined) updates.room_id          = roomId;
    if (roomName      !== undefined) updates.room_name        = roomName;
    if (judgeId       !== undefined) updates.judge_id         = judgeId;
    if (clerkId       !== undefined) updates.clerk_id         = clerkId;
    if (notes         !== undefined) updates.notes            = notes;

    if (!Object.keys(updates).length)
      return res.status(400).json({ error: "No updatable fields provided" });

    updates.updated_at = new Date().toISOString();

    const { data: hearing, error } = await supabaseAdmin
      .from("hearings").update(updates).eq("id", id).select("*").single();

    if (error) return res.status(500).json({ error: "Failed to update hearing", message: error.message });
    if (!hearing) return res.status(404).json({ error: "Hearing not found" });

    return res.json({ ok: true, hearing: normalizeHearing(hearing) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update hearing", message: err.message });
  }
}

/**
 * DELETE /api/hearings/:id
 * Cancel (soft-delete via status) a hearing. Judge / clerk only.
 */
export async function cancelHearing(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const { id } = req.params;
    const { reason } = req.body;

    const { data: hearing, error } = await supabaseAdmin
      .from("hearings")
      .update({ status: "cancelled", notes: reason ? `Cancelled: ${reason}` : "Cancelled", updated_at: new Date().toISOString() })
      .eq("id", id).select("*").single();

    if (error) return res.status(500).json({ error: "Failed to cancel hearing", message: error.message });
    if (!hearing) return res.status(404).json({ error: "Hearing not found" });

    return res.json({ ok: true, hearing: normalizeHearing(hearing) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to cancel hearing", message: err.message });
  }
}

/**
 * GET /api/hearings/rooms
 * Returns a list of courtrooms and their availability.
 * Optional query: ?from=ISO&to=ISO
 */
export async function getRooms(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const { from, to } = req.query;

    // Fetch distinct rooms from hearings (no separate rooms table assumed yet)
    const { data, error } = await supabaseAdmin
      .from("hearings")
      .select("room_id, room_name")
      .not("room_id", "is", null);

    if (error) {
      if (missingTable(error, "hearings"))
        return res.json({ rooms: [], note: "hearings table not yet created" });
      return res.status(500).json({ error: "Failed to load rooms", message: error.message });
    }

    // Deduplicate rooms
    const roomMap = new Map();
    for (const row of data || []) {
      if (row.room_id && !roomMap.has(row.room_id))
        roomMap.set(row.room_id, { id: row.room_id, name: row.room_name });
    }
    const rooms = [...roomMap.values()];

    // If date range given, attach booked slots per room
    if (from && to && rooms.length) {
      const { data: booked } = await supabaseAdmin
        .from("hearings")
        .select("room_id, scheduled_at, duration_minutes, status")
        .not("room_id", "is", null)
        .neq("status", "cancelled")
        .gte("scheduled_at", new Date(from).toISOString())
        .lte("scheduled_at", new Date(to).toISOString());

      const slotsByRoom = (booked || []).reduce((acc, r) => {
        if (!acc[r.room_id]) acc[r.room_id] = [];
        acc[r.room_id].push({ scheduledAt: r.scheduled_at, durationMins: r.duration_minutes, status: r.status });
        return acc;
      }, {});

      for (const room of rooms) room.bookedSlots = slotsByRoom[room.id] || [];
    }

    return res.json({ rooms });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load rooms", message: err.message });
  }
}

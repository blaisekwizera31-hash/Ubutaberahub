/**
 * controllers/appointmentController.js
 */

import { supabaseAdmin } from "../config/supabase.js";
import { fetchAppointmentsByRoleFromDb } from "../config/supabaseStore.js";

const safeRole = (v) =>
  ["citizen", "lawyer", "judge", "clerk"].includes(v) ? v : "citizen";

function normalizeRow(row) {
  const iso = row.starts_at ? new Date(row.starts_at) : new Date();
  return {
    id:           row.id,
    lawyer:       row.metadata?.lawyer || "Lawyer",
    type:         row.appointment_type || "Consultation",
    date:         iso.toISOString().slice(0, 10),
    time:         iso.toISOString().slice(11, 16),
    duration:     `${row.duration_minutes || 30} min`,
    status:       row.status || "pending",
    caseId:       row.case_id || null,
    isVideo:      row.mode === "video",
    notes:        row.notes || "",
    lawyerId:     row.lawyer_id || null,
    citizenId:    row.citizen_id || null,
  };
}

function missingNotificationsTable(err) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes("notifications") && m.includes("does not exist");
}

async function notify({ userId, type, title, body, metadata = {} }) {
  if (!supabaseAdmin || !userId) return;
  const { error } = await supabaseAdmin.from("notifications").insert([{
    user_id: userId, type: type || "general", title: title || "Notification",
    body: body || "", metadata, is_read: false,
  }]);
  if (error && !missingNotificationsTable(error))
    console.error("Notification error:", error.message);
}

/**
 * GET /api/appointments/:role
 * Returns appointments for the authenticated user filtered by their role.
 */
export async function getAppointments(req, res) {
  try {
    const role = safeRole(req.params.role);

    if (supabaseAdmin && req.user) {
      const userId = req.user.id;
      const colMap = { citizen: "citizen_id", lawyer: "lawyer_id", judge: "judge_id", clerk: "clerk_id" };
      const col = colMap[role] || "citizen_id";

      const { data, error } = await supabaseAdmin
        .from("appointments")
        .select("*")
        .eq(col, userId)
        .order("starts_at", { ascending: true })
        .limit(100);

      if (!error) return res.json({ appointments: (data || []).map(normalizeRow) });
    }

    // Fallback to empty list when Supabase is unavailable
    const fromDb = await fetchAppointmentsByRoleFromDb(supabaseAdmin, role);
    return res.json({ appointments: fromDb || [] });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load appointments", message: err.message });
  }
}

/**
 * GET /api/appointments/me
 * Returns all appointments for the current authenticated user (any role).
 */
export async function getMyAppointments(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .or([
        `citizen_id.eq.${userId}`,
        `lawyer_id.eq.${userId}`,
        `judge_id.eq.${userId}`,
        `clerk_id.eq.${userId}`,
      ].join(","))
      .order("starts_at", { ascending: true })
      .limit(200);

    if (error) return res.status(500).json({ error: "Failed to load appointments", message: error.message });

    // Enrich with peer profile name
    const peerIds = [...new Set([
      ...(data || []).map((r) => r.lawyer_id),
      ...(data || []).map((r) => r.citizen_id),
    ].filter(Boolean).filter((id) => id !== userId))];

    const { data: profiles } = peerIds.length
      ? await supabaseAdmin.from("users").select("id, name, email, role").in("id", peerIds)
      : { data: [] };
    const byId = new Map((profiles || []).map((u) => [u.id, u]));

    const appointments = (data || []).map((row) => {
      const peerId = row.lawyer_id === userId ? row.citizen_id : row.lawyer_id;
      const peer = byId.get(peerId);
      return {
        ...normalizeRow(row),
        lawyer: peer?.name || peer?.email?.split("@")[0] || row.metadata?.lawyer || "Lawyer",
        lawyerId: row.lawyer_id,
      };
    });

    return res.json({ appointments });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load appointments", message: err.message });
  }
}

/**
 * POST /api/appointments
 * Book a new appointment.
 */
export async function bookAppointment(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
    const { id: userId } = req.user;
    const { lawyerId, appointmentType, startsAt, durationMinutes, mode, caseId, notes } = req.body;

    if (!lawyerId) return res.status(400).json({ error: "lawyerId is required" });
    if (!startsAt) return res.status(400).json({ error: "startsAt (ISO date string) is required" });

    // Validate lawyer exists
    const { data: lawyer } = await supabaseAdmin
      .from("users").select("id, name, email, role").eq("id", lawyerId).maybeSingle();
    if (!lawyer) return res.status(400).json({ error: "Lawyer not found" });

    const insertPayload = {
      citizen_id:       userId,
      lawyer_id:        lawyerId,
      appointment_type: appointmentType || "Consultation",
      starts_at:        new Date(startsAt).toISOString(),
      duration_minutes: Number(durationMinutes) || 30,
      mode:             mode || "video",
      status:           "pending",
      case_id:          caseId || null,
      notes:            notes || null,
      metadata: {
        lawyer: lawyer.name || lawyer.email?.split("@")[0] || "Lawyer",
        booked_at: new Date().toISOString(),
      },
    };

    const { data: appointment, error } = await supabaseAdmin
      .from("appointments")
      .insert([insertPayload])
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: "Failed to book appointment", message: error.message });

    // Notify lawyer
    await notify({
      userId: lawyerId,
      type: "appointment_request",
      title: "New Appointment Request",
      body: `${req.profile?.name || "A client"} requested a ${appointmentType || "Consultation"} on ${new Date(startsAt).toDateString()}`,
      metadata: { appointmentId: appointment.id, fromUserId: userId },
    });

    return res.status(201).json({ appointment: normalizeRow(appointment) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to book appointment", message: err.message });
  }
}

/**
 * PATCH /api/appointments/:id/status
 * Update appointment status (confirm, cancel, complete).
 */
export async function updateAppointmentStatus(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowed.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` });

    const userId = req.user.id;

    // Verify user is a participant
    const { data: appt } = await supabaseAdmin
      .from("appointments").select("*").eq("id", id).maybeSingle();
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    const isParticipant = appt.citizen_id === userId || appt.lawyer_id === userId;
    if (!isParticipant) return res.status(403).json({ error: "Forbidden" });

    const { data: updated, error } = await supabaseAdmin
      .from("appointments").update({ status }).eq("id", id).select("*").single();
    if (error) return res.status(500).json({ error: "Failed to update appointment", message: error.message });

    // Notify the other party
    const otherId = appt.citizen_id === userId ? appt.lawyer_id : appt.citizen_id;
    await notify({
      userId: otherId,
      type: "appointment_update",
      title: "Appointment Updated",
      body: `Your appointment has been marked as ${status}`,
      metadata: { appointmentId: id, status },
    });

    return res.json({ ok: true, appointment: normalizeRow(updated) });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update appointment", message: err.message });
  }
}

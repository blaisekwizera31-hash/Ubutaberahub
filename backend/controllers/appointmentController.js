/**
 * controllers/appointmentController.js
 */

import * as AppointmentModel from "../models/appointmentModel.js";
import * as UserModel from "../models/userModel.js";
import { notify } from "../utils/notify.js";

const safeRole = (v) =>
  ["citizen", "lawyer", "judge", "clerk"].includes(v) ? v : "citizen";

async function enrichWithPeerProfile(appointments, userId) {
  const peerIds = [...new Set([
    ...appointments.map((r) => r.lawyerId),
    ...appointments.map((r) => r.citizenId),
  ].filter(Boolean).filter((id) => id !== userId))];

  const profiles = peerIds.length
    ? await Promise.all(peerIds.map((id) => UserModel.findById(id)))
    : [];
  const byId = new Map(profiles.filter(Boolean).map((u) => [u.id, u]));

  return appointments.map((row) => {
    const peerId = row.lawyerId === userId ? row.citizenId : row.lawyerId;
    const peer = byId.get(peerId);
    return {
      ...row,
      lawyer: peer?.name || peer?.email?.split("@")[0] || row.lawyerName || "Contact",
      contact: peer?.name || peer?.email?.split("@")[0] || row.lawyerName || "Contact",
      contactPhoto: peer?.profile_photo || peer?.profilePhoto || null,
    };
  });
}

/**
 * GET /api/appointments/:role
 * Returns appointments for the authenticated user filtered by their role.
 */
export async function getAppointments(req, res) {
  try {
    const role = safeRole(req.params.role);
    const userId = req.user.id;
    
    const appointments = await AppointmentModel.listByRole(role, userId);
    const enriched = await enrichWithPeerProfile(appointments, userId);
    return res.json({ appointments: enriched });
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
    const userId = req.user.id;
    const appointments = await AppointmentModel.listForUser(userId);

    const enriched = await enrichWithPeerProfile(appointments, userId);

    return res.json({ appointments: enriched });
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
    const { id: userId } = req.user;
    const { lawyerId, appointmentType, startsAt, durationMinutes, mode, caseId, notes } = req.body;

    if (!lawyerId) return res.status(400).json({ error: "lawyerId is required" });
    if (!startsAt) return res.status(400).json({ error: "startsAt (ISO date string) is required" });

    // Validate lawyer exists
    const lawyer = await UserModel.findById(lawyerId);
    if (!lawyer) return res.status(400).json({ error: "Lawyer not found" });

    const appointment = await AppointmentModel.create({
      citizenId:       userId,
      lawyerId:        lawyerId,
      appointmentType: appointmentType || "Consultation",
      startsAt:        startsAt,
      durationMinutes: durationMinutes,
      mode:             mode,
      caseId:          caseId,
      notes:            notes,
      lawyerName:      lawyer.name || lawyer.email?.split("@")[0] || "Lawyer",
    });

    // Notify lawyer
    await notify({
      userId: lawyerId,
      type: "appointment_request",
      title: "New Appointment Request",
      body: `${req.user.name || "A client"} requested a ${appointmentType || "Consultation"} on ${new Date(startsAt).toDateString()}`,
      metadata: { appointmentId: appointment.id, fromUserId: userId },
    });

    return res.status(201).json({ appointment });
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
    const { id } = req.params;
    const { status } = req.body;
    
    if (!AppointmentModel.APPOINTMENT_STATUSES.includes(status))
      return res.status(400).json({ error: `Invalid status` });

    const userId = req.user.id;

    const appt = await AppointmentModel.findById(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    const isParticipant = appt.citizenId === userId || appt.lawyerId === userId;
    if (!isParticipant) return res.status(403).json({ error: "Forbidden" });

    const updated = await AppointmentModel.updateStatus(id, status);

    // Notify the other party
    const otherId = appt.citizenId === userId ? appt.lawyerId : appt.citizenId;
    if (otherId) {
      await notify({
        userId: otherId,
        type: "appointment_update",
        title: "Appointment Updated",
        body: `Your appointment has been marked as ${status}`,
        metadata: { appointmentId: id, status },
      });
    }

    return res.json({ ok: true, appointment: updated });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update appointment", message: err.message });
  }
}

/**
 * controllers/hearingController.js
 * Manages court hearing calendar dates, room scheduling, and judicial assignments using PostgreSQL.
 */

import * as HearingModel from "../models/hearingModel.js";
import * as CaseModel from "../models/caseModel.js";
import { notify } from "../utils/notify.js";

/**
 * GET /api/hearings
 */
export async function getHearings(req, res) {
  try {
    const userId = req.user.id;
    const role   = req.user.role || "citizen";
    const { status, from, to, caseId, limit = 100, offset = 0 } = req.query;

    let hearings = [];
    
    if (role === "judge") {
      hearings = await HearingModel.listForJudge(userId, { status, from, to, limit, offset });
    } else if (role === "clerk") {
      hearings = await HearingModel.listForClerk(userId, { status, from, to, limit, offset });
    } else {
      // lawyer or citizen: first get their cases
      const cases = await CaseModel.listForUser(userId);
      const caseIds = cases.map(c => c.id);
      
      if (!caseIds.length) return res.json({ hearings: [] });
      
      // For simplicity, we just filter the hearings we can find. 
      // In a real app we'd have a specific listByCaseIds method in the model.
      // Here we'll just check if a specific caseId was requested or return none for now
      // to avoid massive over-fetching if we don't have a bulk query method yet.
      if (caseId && caseIds.includes(caseId)) {
        hearings = await HearingModel.listForCase(caseId, { status, limit, offset });
      } else {
        // Fetch for all cases - normally you'd do a JOIN but let's do this for now
        const allHearings = await Promise.all(caseIds.map(id => HearingModel.listForCase(id, { status })));
        hearings = allHearings.flat().sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)).slice(offset, offset + limit);
      }
    }

    return res.json({ hearings });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load hearings", message: err.message });
  }
}

/**
 * GET /api/hearings/:id
 */
export async function getHearingById(req, res) {
  try {
    const hearing = await HearingModel.findById(req.params.id);
    if (!hearing) return res.status(404).json({ error: "Hearing not found" });
    return res.json({ hearing });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load hearing", message: err.message });
  }
}

/**
 * POST /api/hearings
 */
export async function scheduleHearing(req, res) {
  try {
    const {
      caseId, hearingType, scheduledAt, durationMinutes,
      roomId, roomName, judgeId, clerkId, notes,
    } = req.body;

    if (!caseId)      return res.status(400).json({ error: "caseId is required" });
    if (!scheduledAt) return res.status(400).json({ error: "scheduledAt (ISO string) is required" });
    if (!judgeId)     return res.status(400).json({ error: "judgeId is required" });

    const caseRow = await CaseModel.findById(caseId);
    if (!caseRow) return res.status(400).json({ error: "Case not found" });

    // Check room availability
    if (roomId) {
      const conflicts = await HearingModel.checkRoomConflict(roomId, scheduledAt, durationMinutes);
      if (conflicts?.length)
        return res.status(409).json({
          error:     "Room conflict",
          message:   `Room is already booked for ${conflicts.length} hearing(s) in that time slot.`,
        });
    }

    const hearing = await HearingModel.schedule({
      caseId, 
      hearingType, 
      scheduledAt, 
      durationMinutes,
      roomId, 
      roomName, 
      judgeId, 
      clerkId: clerkId || req.user.id, 
      notes,
      metadata: {
        case_number:  caseRow.caseNumber,
        case_title:   caseRow.title,
        scheduled_by: req.user.id,
        scheduled_at: new Date().toISOString(),
      },
    });

    // Notify relevant parties
    const notifyTargets = [caseRow.citizenId, caseRow.lawyerId, judgeId].filter(Boolean);
    await Promise.all(notifyTargets.map((uid) =>
      notify({
        userId:   uid,
        type:     "hearing_scheduled",
        title:    "Hearing Scheduled",
        body:     `A ${hearing.type} hearing for case ${caseRow.caseNumber || caseId} is scheduled on ${new Date(hearing.scheduledAt).toDateString()}.`,
        metadata: { hearingId: hearing.id, caseId, scheduledAt: hearing.scheduledAt },
      })
    ));

    return res.status(201).json({ hearing });
  } catch (err) {
    return res.status(500).json({ error: "Failed to schedule hearing", message: err.message });
  }
}

/**
 * PATCH /api/hearings/:id
 */
export async function updateHearing(req, res) {
  try {
    const { id } = req.params;
    const hearing = await HearingModel.update(id, req.body);
    return res.json({ ok: true, hearing });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update hearing", message: err.message });
  }
}

/**
 * DELETE /api/hearings/:id
 */
export async function cancelHearing(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const hearing = await HearingModel.cancel(id, reason);
    return res.json({ ok: true, hearing });
  } catch (err) {
    return res.status(500).json({ error: "Failed to cancel hearing", message: err.message });
  }
}

/**
 * GET /api/hearings/rooms
 */
export async function getRooms(req, res) {
  try {
    const { from, to } = req.query;
    const rooms = await HearingModel.listRooms({ from, to });
    return res.json({ rooms });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load rooms", message: err.message });
  }
}

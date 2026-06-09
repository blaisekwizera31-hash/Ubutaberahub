/**
 * controllers/caseController.js
 */

import pool from "../config/db.js";
import {
  fetchCasesByRoleFromDb,
  fetchDashboardBundleFromDb,
} from "../config/dbStore.js";
import * as CaseModel from "../models/caseModel.js";
import * as UserModel from "../models/userModel.js";
import { uploadCaseEvidenceFile } from "../config/cloudinary.js";

const safeRole     = (v) => ["citizen","lawyer","judge","clerk"].includes(v) ? v : "citizen";
const safePriority = (v) => ["low","medium","high","urgent"].includes(v) ? v : "medium";

async function notify({ userId, type, title, body, metadata = {} }) {
  if (!userId) return;
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, title, body, metadata, is_read, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [userId, type || "general", title || "Notification", body || "", metadata, false]
    );
  } catch (err) {
    console.error("Notification error:", err.message);
  }
}

export async function getDashboard(req, res) {
  const role   = safeRole(req.params.role);
  const userId = req.user?.id || null;
  const fromDb = await fetchDashboardBundleFromDb(role, userId);
  return res.json(fromDb || { stats: {}, cases: [], appointments: [], messages: [] });
}

export async function getCasesByRoleHandler(req, res) {
  const role   = safeRole(req.params.role);
  const userId = req.user?.id || null;
  const fromDb = await fetchCasesByRoleFromDb(role, userId);
  return res.json({ cases: fromDb || [] });
}

export async function getMyCases(req, res) {
  try {
    const { id } = req.user;
    const cases = await CaseModel.listForUser(id);
    return res.json({ cases });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load my cases", message: err.message });
  }
}

export async function submitCaseToLawyer(req, res) {
  try {
    const citizenProfile = req.user;
    if (!citizenProfile)              return res.status(400).json({ error: "Citizen profile not found" });
    if (citizenProfile.role !== "citizen")
      return res.status(403).json({ error: "Only citizens can submit cases" });

    const { title, description, caseType, priority, lawyerId } = req.body;

    const lawyerProfile = await UserModel.findById(lawyerId);
    if (!lawyerProfile || lawyerProfile.role !== "lawyer")
      return res.status(400).json({ error: "Invalid lawyer selected" });

    const newCase = await CaseModel.create({
      title: title.trim(),
      description: description.trim(),
      caseType: caseType.trim(),
      priority,
      citizenId: req.user.id,
      lawyerId: lawyerId,
      metadata: {
        submitted_to_lawyer: true,
        submitted_at: new Date().toISOString(),
        supporting_documents: [],
      }
    });

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    for (const file of uploadedFiles) {
      const uploaded = await uploadCaseEvidenceFile(file);
      await CaseModel.addEvidence({
        caseId: newCase.id,
        uploadedBy: req.user.id,
        fileName: file.originalname,
        fileUrl: uploaded.url,
        fileType: file.mimetype,
        fileSizeBytes: file.size,
      });
    }

    await notify({
      userId:   lawyerId,
      type:     "new_case",
      title:    "New Case Assigned",
      body:     `${citizenProfile.name || "Citizen"} submitted "${newCase.title}"`,
      metadata: { caseId: newCase.id, caseNumber: newCase.caseNumber, fromUserId: req.user.id },
    });

    return res.status(201).json({
      ok: true, case: newCase,
      lawyer: { id: lawyerProfile.id, name: lawyerProfile.name || lawyerProfile.email?.split("@")[0] || "Lawyer" },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to submit case", message: err.message });
  }
}

export async function getCaseDetails(req, res) {
  try {
    const { id } = req.params;
    const caseRow = await CaseModel.findById(id);
    if (!caseRow) return res.status(404).json({ error: "Case not found" });

    const userId = req.user.id;
    const isParticipant =
      caseRow.citizenId === userId ||
      caseRow.lawyerId === userId ||
      caseRow.judgeId === userId ||
      caseRow.clerkId === userId;

    if (!isParticipant) {
      return res.status(403).json({ error: "You are not a participant in this case" });
    }

    const [citizen, lawyer, evidence] = await Promise.all([
      caseRow.citizenId ? UserModel.findById(caseRow.citizenId) : null,
      caseRow.lawyerId ? UserModel.findById(caseRow.lawyerId) : null,
      CaseModel.listEvidence(caseRow.id).catch(() => []),
    ]);

    return res.json({
      case: caseRow,
      citizen: citizen
        ? {
            id: citizen.id,
            name: citizen.name,
            email: citizen.email,
            phone: citizen.phone,
            profile_photo: citizen.profile_photo,
            role: citizen.role,
          }
        : null,
      lawyer: lawyer
        ? {
            id: lawyer.id,
            name: lawyer.name,
            email: lawyer.email,
            phone: lawyer.phone,
            profile_photo: lawyer.profile_photo,
            role: lawyer.role,
          }
        : null,
      evidence: evidence.length ? evidence : (caseRow.metadata?.supporting_documents || []).map((doc, index) => ({
        id: `metadata-${index}`,
        file_name: doc.name,
        file_url: null,
        file_type: doc.type,
        file_size_bytes: doc.size,
        notes: "File metadata captured during case submission. File storage is not connected yet.",
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load case details", message: err.message });
  }
}

export async function approveCase(req, res) {
  try {
    const { id } = req.params;
    const caseRow = await CaseModel.findById(id);
    if (!caseRow) return res.status(404).json({ error: "Case not found" });

    if (req.user.role !== "lawyer" || caseRow.lawyerId !== req.user.id) {
      return res.status(403).json({ error: "Only the assigned lawyer can approve this case" });
    }

    const updated = await CaseModel.updateStatus(id, "Accepted");

    await notify({
      userId: caseRow.citizenId,
      type: "case_accepted",
      title: "Case Accepted",
      body: `${req.user.name || "Your lawyer"} accepted your case "${caseRow.title}"`,
      metadata: { caseId: id, caseNumber: caseRow.caseNumber, status: "Accepted" },
    });

    return res.json({ ok: true, case: updated });
  } catch (err) {
    return res.status(500).json({ error: "Failed to approve case", message: err.message });
  }
}

export async function updateCaseStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["Pending", "Accepted", "In Progress", "Under Review", "Awaiting Ruling", "Closed", "Resolved", "Rejected"];
    if (!allowed.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` });

    const userId = req.user.id;

    const caseRow = await CaseModel.findById(id);
    if (!caseRow) return res.status(404).json({ error: "Case not found" });

    const isParticipant =
      caseRow.citizenId === userId ||
      caseRow.lawyerId === userId ||
      caseRow.judgeId === userId ||
      caseRow.clerkId === userId;

    if (!isParticipant)
      return res.status(403).json({ error: "You are not a participant in this case" });

    const updated = await CaseModel.updateStatus(id, status);

    // Notify citizen if updated by lawyer/judge/clerk
    if (caseRow.citizenId && caseRow.citizenId !== userId) {
      await notify({
        userId:   caseRow.citizenId,
        type:     "case_update",
        title:    "Case Status Updated",
        body:     `Your case "${caseRow.title}" is now: ${status}`,
        metadata: { caseId: id, caseNumber: caseRow.caseNumber, status },
      });
    }

    // Notify lawyer if updated by citizen/judge/clerk
    if (caseRow.lawyerId && caseRow.lawyerId !== userId) {
      await notify({
        userId:   caseRow.lawyerId,
        type:     "case_update",
        title:    "Case Status Updated",
        body:     `Case "${caseRow.title}" is now: ${status}`,
        metadata: { caseId: id, caseNumber: caseRow.caseNumber, status },
      });
    }

    return res.json({ ok: true, case: updated });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update case status", message: err.message });
  }
}

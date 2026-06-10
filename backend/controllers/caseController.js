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

const safeRole     = (v) => ["citizen","lawyer","judge","clerk","court_admin"].includes(v) ? v : "citizen";
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

async function resolveCitizenMatch({ name, email, phone }) {
  const exact = await UserModel.findBestCitizenMatch({ name, email, phone });
  if (exact) return exact;
  const matches = await UserModel.searchCitizens(name || email || phone || "", { limit: 1 });
  return matches[0] || null;
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

export async function getAllCasesForClerk(req, res) {
  try {
    if (req.user?.role !== "clerk") {
      return res.status(403).json({ error: "Only court clerks can view all registry cases" });
    }

    const cases = await CaseModel.listAll();
    return res.json({ cases });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load all cases", message: err.message });
  }
}

export async function getSubmittedDocumentsForClerk(req, res) {
  try {
    if (req.user?.role !== "clerk") {
      return res.status(403).json({ error: "Only court clerks can view submitted documents" });
    }

    const documents = await CaseModel.listAllEvidence();
    return res.json({ documents });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load submitted documents", message: err.message });
  }
}

export async function getCitizenCourtUpdates(req, res) {
  try {
    if (req.user?.role !== "citizen") {
      return res.status(403).json({ error: "Only citizens can view court updates" });
    }

    const cases = await CaseModel.listCourtUpdatesForCitizen(req.user.id);
    return res.json({ updates: cases });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load court updates", message: err.message });
  }
}

export async function getCourtAdminQueue(req, res) {
  try {
    if (!["court_admin", "judge"].includes(req.user?.role)) {
      return res.status(403).json({ error: "Only court administration can view assignment queue" });
    }

    const [cases, judges] = await Promise.all([
      CaseModel.listAssignmentQueue(),
      CaseModel.listJudgeWorkloads(),
    ]);

    return res.json({ cases, judges });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load assignment queue", message: err.message });
  }
}

export async function assignCaseToJudge(req, res) {
  try {
    if (!["court_admin", "judge"].includes(req.user?.role)) {
      return res.status(403).json({ error: "Only court administration can assign cases" });
    }

    const { caseId, judgeId, suggestedHearingAt, notes } = req.body;
    if (!caseId || !judgeId) {
      return res.status(400).json({ error: "caseId and judgeId are required" });
    }

    const judge = await UserModel.findById(judgeId);
    if (!judge || judge.role !== "judge") {
      return res.status(400).json({ error: "Selected user is not a judge" });
    }

    const updated = await CaseModel.assignToJudge({
      caseId,
      judgeId,
      suggestedHearingAt,
      notes,
      assignedBy: req.user.id,
    });
    if (!updated) return res.status(404).json({ error: "Case not found" });

    await notify({
      userId: judgeId,
      type: "case_assigned_to_judge",
      title: "Case Assigned",
      body: `Case ${updated.caseNumber} was assigned to you.`,
      metadata: { caseId: updated.id, caseNumber: updated.caseNumber, suggestedHearingAt: suggestedHearingAt || null },
    });

    if (updated.citizenId) {
      await notify({
        userId: updated.citizenId,
        type: "court_case_assigned",
        title: "Court Case Assigned",
        body: `Your case ${updated.caseNumber} was assigned to ${judge.name || "a judge"}.`,
        metadata: { caseId: updated.id, caseNumber: updated.caseNumber, judgeId },
      });
    }

    return res.json({ ok: true, case: updated, judge: { id: judge.id, name: judge.name, email: judge.email } });
  } catch (err) {
    return res.status(500).json({ error: "Failed to assign case", message: err.message });
  }
}

export async function createRegistryCase(req, res) {
  try {
    if (req.user?.role !== "clerk") {
      return res.status(403).json({ error: "Only court clerks can register new cases" });
    }

    const { title, description, caseType, priority } = req.body;
    if (!title || String(title).trim().length < 3) {
      return res.status(400).json({ error: "Validation failed", message: "Case title is required" });
    }
    if (!description || String(description).trim().length < 10) {
      return res.status(400).json({ error: "Validation failed", message: "Case summary must be at least 10 characters" });
    }
    if (!caseType || String(caseType).trim().length < 2) {
      return res.status(400).json({ error: "Validation failed", message: "Case type is required" });
    }

    const citizenMatch = await resolveCitizenMatch({
      name: req.body.claimantName,
      email: req.body.claimantEmail,
      phone: req.body.claimantPhone,
    });

    const metadata = {
      registered_by_clerk: true,
      registered_by: req.user.id,
      registered_at: new Date().toISOString(),
      claimant_name: String(req.body.claimantName || "").trim(),
      citizen_name: String(req.body.claimantName || "").trim(),
      linked_citizen_id: citizenMatch?.id || null,
      linked_citizen_name: citizenMatch?.name || null,
      claimant_email: String(req.body.claimantEmail || "").trim(),
      claimant_phone: String(req.body.claimantPhone || "").trim(),
      claimant_national_id: String(req.body.claimantNationalId || "").trim(),
      respondent_name: String(req.body.respondentName || "").trim(),
      respondent_email: String(req.body.respondentEmail || "").trim(),
      respondent_phone: String(req.body.respondentPhone || "").trim(),
      court_division: String(req.body.courtDivision || "").trim(),
      filing_channel: String(req.body.filingChannel || "Counter").trim(),
      filing_fee_status: String(req.body.filingFeeStatus || "Pending").trim(),
      incident_date: String(req.body.incidentDate || "").trim(),
      registry_notes: String(req.body.registryNotes || "").trim(),
      parties: [req.body.claimantName, req.body.respondentName].filter(Boolean).join(" vs "),
      supporting_documents: [],
    };

    const newCase = await CaseModel.create({
      title: String(title).trim(),
      description: String(description).trim(),
      caseType: String(caseType).trim(),
      priority: safePriority(priority),
      status: "Awaiting Assignment",
      citizenId: citizenMatch?.id || null,
      clerkId: req.user.id,
      metadata,
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
        notes: "Submitted during clerk registry intake",
      });
    }

    if (citizenMatch?.id) {
      await notify({
        userId: citizenMatch.id,
        type: "court_case_registered",
        title: "Court Case Registered",
        body: `A court case ${newCase.caseNumber} was registered in your name.`,
        metadata: { caseId: newCase.id, caseNumber: newCase.caseNumber },
      });
    }

    return res.status(201).json({ ok: true, case: newCase });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Duplicate case ID", message: "A case with this court case ID already exists" });
    }
    return res.status(500).json({ error: "Failed to register case", message: err.message });
  }
}

export async function updateRegistryCase(req, res) {
  try {
    if (req.user?.role !== "clerk") {
      return res.status(403).json({ error: "Only court clerks can edit registry cases" });
    }

    const caseRow = await CaseModel.findById(req.params.id);
    if (!caseRow) return res.status(404).json({ error: "Case not found" });
    if (caseRow.metadata?.registered_by_clerk !== true) {
      return res.status(403).json({ error: "Only court-registered cases can be edited here" });
    }

    const citizenMatch = await resolveCitizenMatch({
      name: req.body.claimantName,
      email: req.body.claimantEmail,
      phone: req.body.claimantPhone,
    });
    const linkedCitizenId = citizenMatch?.id || caseRow.citizenId || null;
    const nextHearingAt = String(req.body.nextHearingAt || "").trim();

    const metadata = {
      ...(caseRow.metadata || {}),
      claimant_name: String(req.body.claimantName || caseRow.metadata?.claimant_name || "").trim(),
      citizen_name: String(req.body.claimantName || caseRow.metadata?.citizen_name || "").trim(),
      claimant_email: String(req.body.claimantEmail || caseRow.metadata?.claimant_email || "").trim(),
      claimant_phone: String(req.body.claimantPhone || caseRow.metadata?.claimant_phone || "").trim(),
      respondent_name: String(req.body.respondentName || caseRow.metadata?.respondent_name || "").trim(),
      respondent_email: String(req.body.respondentEmail || caseRow.metadata?.respondent_email || "").trim(),
      respondent_phone: String(req.body.respondentPhone || caseRow.metadata?.respondent_phone || "").trim(),
      registry_notes: String(req.body.registryNotes || caseRow.metadata?.registry_notes || "").trim(),
      court_division: String(req.body.courtDivision || caseRow.metadata?.court_division || "").trim(),
      filing_fee_status: String(req.body.filingFeeStatus || caseRow.metadata?.filing_fee_status || "Pending").trim(),
      next_hearing_at: nextHearingAt || caseRow.metadata?.next_hearing_at || null,
      linked_citizen_id: linkedCitizenId,
      linked_citizen_name: citizenMatch?.name || caseRow.metadata?.linked_citizen_name || null,
      last_clerk_update_at: new Date().toISOString(),
      last_clerk_update_note: String(req.body.updateNote || "").trim(),
    };

    const updated = await CaseModel.updateRegistryCase(caseRow.id, {
      title: req.body.title,
      description: req.body.description,
      caseType: req.body.caseType,
      priority: req.body.priority,
      status: req.body.status,
      citizenId: linkedCitizenId,
      metadata,
    });

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    for (const file of uploadedFiles) {
      const uploaded = await uploadCaseEvidenceFile(file);
      await CaseModel.addEvidence({
        caseId: updated.id,
        uploadedBy: req.user.id,
        fileName: file.originalname,
        fileUrl: uploaded.url,
        fileType: file.mimetype,
        fileSizeBytes: file.size,
        notes: "Added during clerk case edit",
      });
    }

    if (linkedCitizenId) {
      await notify({
        userId: linkedCitizenId,
        type: nextHearingAt ? "court_hearing_update" : "court_case_update",
        title: nextHearingAt ? "Next Hearing Date Added" : "Court Case Updated",
        body: nextHearingAt
          ? `Next hearing for case ${updated.caseNumber} is ${new Date(nextHearingAt).toLocaleString()}.`
          : `Court case ${updated.caseNumber} was updated by the clerk.`,
        metadata: { caseId: updated.id, caseNumber: updated.caseNumber, nextHearingAt: nextHearingAt || null },
      });
    }

    return res.json({ ok: true, case: updated });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update registry case", message: err.message });
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
      return res.status(400).json({ error: "Invalid attorney selected" });

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
      lawyer: { id: lawyerProfile.id, name: lawyerProfile.name || lawyerProfile.email?.split("@")[0] || "Attorney" },
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
      return res.status(403).json({ error: "Only the assigned attorney can approve this case" });
    }

    const updated = await CaseModel.updateStatus(id, "Accepted");

    await notify({
      userId: caseRow.citizenId,
      type: "case_accepted",
      title: "Case Accepted",
      body: `${req.user.name || "Your attorney"} accepted your case "${caseRow.title}"`,
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

    // Notify citizen if updated by attorney/judge/clerk
    if (caseRow.citizenId && caseRow.citizenId !== userId) {
      await notify({
        userId:   caseRow.citizenId,
        type:     "case_update",
        title:    "Case Status Updated",
        body:     `Your case "${caseRow.title}" is now: ${status}`,
        metadata: { caseId: id, caseNumber: caseRow.caseNumber, status },
      });
    }

    // Notify attorney if updated by citizen/judge/clerk
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

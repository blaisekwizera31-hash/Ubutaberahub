/**
 * models/caseModel.js
 * Handles digital case creation, evidence documentation filing,
 * and real-time status tracking.
 *
 * Table: cases
 * Related: case_evidence (file attachments), notifications
 */

import { supabaseAdmin } from "../config/supabase.js";

// ── Constants ─────────────────────────────────────────────────────────────────

export const CASE_STATUSES = Object.freeze([
  "Pending", "In Progress", "Under Review",
  "Awaiting Ruling", "Closed", "Resolved", "Rejected",
]);

export const CASE_PRIORITIES = Object.freeze(["low", "medium", "high", "urgent"]);

export const CASE_TYPES = Object.freeze([
  "Criminal Defense", "Family Law", "Property Dispute",
  "Employment Law", "Contract Dispute", "Business Law",
  "Civil Rights", "Immigration", "Inheritance", "Other",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

export function safePriority(v) {
  return CASE_PRIORITIES.includes(v) ? v : "medium";
}

export function safeStatus(v) {
  return CASE_STATUSES.includes(v) ? v : "Pending";
}

export function generateCaseNumber() {
  return `CASE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function normalize(row) {
  return {
    id:              row.id,
    caseNumber:      row.case_number  || row.id,
    title:           row.title,
    description:     row.description  || "",
    caseType:        row.case_type    || "Other",
    status:          row.status       || "Pending",
    priority:        row.priority     || "medium",
    filedAt:         row.filed_at     || row.created_at,
    citizenId:       row.citizen_id   || null,
    lawyerId:        row.assigned_lawyer_id || null,
    judgeId:         row.assigned_judge_id  || null,
    clerkId:         row.assigned_clerk_id  || null,
    evidenceCount:   row.metadata?.evidence_count || 0,
    metadata:        row.metadata     || {},
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

function missingTable(err) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes("cases") && m.includes("does not exist");
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * findById — Fetch a full case row by UUID or case_number.
 */
export async function findById(id, db = supabaseAdmin) {
  if (!db || !id) return null;
  const { data, error } = await db.from("cases").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`[caseModel.findById] ${error.message}`);
  return data ? normalize(data) : null;
}

/**
 * findByCaseNumber — Fetch by human-readable case number string.
 */
export async function findByCaseNumber(caseNumber, db = supabaseAdmin) {
  if (!db || !caseNumber) return null;
  const { data, error } = await db
    .from("cases").select("*").eq("case_number", caseNumber).maybeSingle();
  if (error) throw new Error(`[caseModel.findByCaseNumber] ${error.message}`);
  return data ? normalize(data) : null;
}

/**
 * listForUser — Returns all cases where the user appears in any participant column.
 *
 * @param {string} userId
 * @param {{ limit?, offset?, status? }} opts
 */
export async function listForUser(userId, opts = {}, db = supabaseAdmin) {
  if (!db || !userId) return [];
  const { limit = 100, offset = 0, status } = opts;

  let q = db
    .from("cases")
    .select("*")
    .or([
      `citizen_id.eq.${userId}`,
      `assigned_lawyer_id.eq.${userId}`,
      `assigned_judge_id.eq.${userId}`,
      `assigned_clerk_id.eq.${userId}`,
    ].join(","))
    .order("filed_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && CASE_STATUSES.includes(status)) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) {
    if (missingTable(error)) return [];
    throw new Error(`[caseModel.listForUser] ${error.message}`);
  }
  return (data || []).map(normalize);
}

/**
 * create — Insert a new case row.
 *
 * @param {{ title, description, caseType, priority, citizenId, lawyerId }} payload
 */
export async function create(payload, db = supabaseAdmin) {
  if (!db) throw new Error("[caseModel.create] Supabase not configured");

  const row = {
    case_number:        generateCaseNumber(),
    title:              String(payload.title).trim(),
    description:        String(payload.description || "").trim(),
    case_type:          payload.caseType   || "Other",
    status:             "Pending",
    priority:           safePriority(payload.priority),
    citizen_id:         payload.citizenId  || null,
    assigned_lawyer_id: payload.lawyerId   || null,
    assigned_judge_id:  payload.judgeId    || null,
    assigned_clerk_id:  payload.clerkId    || null,
    filed_at:           new Date().toISOString(),
    metadata:           payload.metadata   || {},
  };

  const { data, error } = await db.from("cases").insert([row]).select("*").single();
  if (error) throw new Error(`[caseModel.create] ${error.message}`);
  return normalize(data);
}

/**
 * updateStatus — Change a case's status. Returns the updated normalized row.
 */
export async function updateStatus(id, status, db = supabaseAdmin) {
  if (!db) throw new Error("[caseModel.updateStatus] Supabase not configured");
  if (!CASE_STATUSES.includes(status))
    throw new Error(`[caseModel.updateStatus] Invalid status: ${status}`);

  const { data, error } = await db
    .from("cases")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`[caseModel.updateStatus] ${error.message}`);
  return normalize(data);
}

/**
 * assignJudge — Assign or re-assign a judge to a case.
 */
export async function assignJudge(caseId, judgeId, db = supabaseAdmin) {
  if (!db) throw new Error("[caseModel.assignJudge] Supabase not configured");
  const { data, error } = await db
    .from("cases")
    .update({ assigned_judge_id: judgeId, updated_at: new Date().toISOString() })
    .eq("id", caseId)
    .select("*")
    .single();
  if (error) throw new Error(`[caseModel.assignJudge] ${error.message}`);
  return normalize(data);
}

// ── Evidence ──────────────────────────────────────────────────────────────────

/**
 * addEvidence — Attach a file/document record to a case.
 *
 * @param {{ caseId, uploadedBy, fileName, fileUrl, fileType, fileSizeBytes, notes }} payload
 */
export async function addEvidence(payload, db = supabaseAdmin) {
  if (!db) throw new Error("[caseModel.addEvidence] Supabase not configured");

  const { data, error } = await db
    .from("case_evidence")
    .insert([{
      case_id:        payload.caseId,
      uploaded_by:    payload.uploadedBy,
      file_name:      payload.fileName,
      file_url:       payload.fileUrl,
      file_type:      payload.fileType      || "document",
      file_size_bytes: payload.fileSizeBytes || 0,
      notes:          payload.notes         || null,
      uploaded_at:    new Date().toISOString(),
    }])
    .select("*")
    .single();

  if (error) throw new Error(`[caseModel.addEvidence] ${error.message}`);
  return data;
}

/**
 * listEvidence — All evidence documents attached to a case.
 */
export async function listEvidence(caseId, db = supabaseAdmin) {
  if (!db || !caseId) return [];
  const { data, error } = await db
    .from("case_evidence")
    .select("*")
    .eq("case_id", caseId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    const m = String(error.message || "").toLowerCase();
    if (m.includes("case_evidence") && m.includes("does not exist")) return [];
    throw new Error(`[caseModel.listEvidence] ${error.message}`);
  }
  return data || [];
}

// ── Analytics helpers ─────────────────────────────────────────────────────────

/**
 * countByStatus — Returns { Pending: n, "In Progress": n, … }
 */
export async function countByStatus(db = supabaseAdmin) {
  if (!db) return {};
  const { data, error } = await db.from("cases").select("status");
  if (error) {
    if (missingTable(error)) return {};
    throw new Error(`[caseModel.countByStatus] ${error.message}`);
  }
  return (data || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
}

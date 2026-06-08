/**
 * models/caseModel.js
 * Handles digital case creation, evidence documentation filing,
 * and real-time status tracking using PostgreSQL.
 */

import pool from "../config/db.js";

// ── Constants ─────────────────────────────────────────────────────────────────

export const CASE_STATUSES = Object.freeze([
  "Pending", "Accepted", "In Progress", "Under Review",
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
  if (!row) return null;
  const citizenName = row.citizen_name || row.metadata?.citizen_name || null;
  const lawyerName = row.lawyer_name || row.metadata?.lawyer || null;
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
    citizen:         citizenName,
    requestedBy:     citizenName,
    citizenPhoto:    row.citizen_photo || null,
    citizenEmail:    row.citizen_email || null,
    citizenPhone:    row.citizen_phone || null,
    lawyer:          lawyerName,
    lawyerPhoto:     row.lawyer_photo || null,
    lawyerEmail:     row.lawyer_email || null,
    lawyerPhone:     row.lawyer_phone || null,
    evidenceCount:   row.metadata?.evidence_count || 0,
    metadata:        row.metadata     || {},
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * findById — Fetch a full case row by UUID or case_number.
 */
export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM cases WHERE id::text = $1 OR case_number = $1', [id]);
  return normalize(rows[0]);
}

/**
 * findByCaseNumber — Fetch by human-readable case number string.
 */
export async function findByCaseNumber(caseNumber) {
  const { rows } = await pool.query('SELECT * FROM cases WHERE case_number = $1', [caseNumber]);
  return normalize(rows[0]);
}

/**
 * listForUser — Returns all cases where the user appears in any participant column.
 */
export async function listForUser(userId, opts = {}) {
  const { limit = 100, offset = 0, status } = opts;

  let query = `
    SELECT
      cases.*,
      citizen.name as citizen_name,
      citizen.email as citizen_email,
      citizen.phone as citizen_phone,
      citizen.profile_photo as citizen_photo,
      lawyer.name as lawyer_name,
      lawyer.email as lawyer_email,
      lawyer.phone as lawyer_phone,
      lawyer.profile_photo as lawyer_photo
    FROM cases
    LEFT JOIN users citizen ON citizen.id = cases.citizen_id
    LEFT JOIN users lawyer ON lawyer.id = cases.assigned_lawyer_id
    WHERE (citizen_id = $1 OR assigned_lawyer_id = $1 OR assigned_judge_id = $1 OR assigned_clerk_id = $1)
  `;
  const values = [userId];
  let idx = 2;

  if (status && CASE_STATUSES.includes(status)) {
    query += ` AND status = $${idx++}`;
    values.push(status);
  }

  query += ` ORDER BY filed_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows.map(normalize);
}

/**
 * create — Insert a new case row.
 */
export async function create(payload) {
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
    metadata:           payload.metadata   || {},
  };

  const query = `
    INSERT INTO cases (
      case_number, title, description, case_type, status, priority, 
      citizen_id, assigned_lawyer_id, assigned_judge_id, assigned_clerk_id, 
      filed_at, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
    RETURNING *
  `;
  
  const values = [
    row.case_number, row.title, row.description, row.case_type, row.status, row.priority,
    row.citizen_id, row.assigned_lawyer_id, row.assigned_judge_id, row.assigned_clerk_id,
    row.metadata
  ];

  const { rows } = await pool.query(query, values);
  return normalize(rows[0]);
}

/**
 * updateStatus — Change a case's status.
 */
export async function updateStatus(id, status) {
  if (!CASE_STATUSES.includes(status))
    throw new Error(`[caseModel.updateStatus] Invalid status: ${status}`);

  const { rows } = await pool.query(
    'UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  return normalize(rows[0]);
}

/**
 * assignJudge — Assign or re-assign a judge to a case.
 */
export async function assignJudge(caseId, judgeId) {
  const { rows } = await pool.query(
    'UPDATE cases SET assigned_judge_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [judgeId, caseId]
  );
  return normalize(rows[0]);
}

// ── Evidence ──────────────────────────────────────────────────────────────────

/**
 * addEvidence — Attach a file/document record to a case.
 */
export async function addEvidence(payload) {
  const query = `
    INSERT INTO case_evidence (
      case_id, uploaded_by, file_name, file_url, file_type, file_size_bytes, notes, uploaded_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
  `;
  const values = [
    payload.caseId,
    payload.uploadedBy,
    payload.fileName,
    payload.fileUrl,
    payload.fileType || "document",
    payload.fileSizeBytes || 0,
    payload.notes || null
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * listEvidence — All evidence documents attached to a case.
 */
export async function listEvidence(caseId) {
  const { rows } = await pool.query(
    'SELECT * FROM case_evidence WHERE case_id = $1 ORDER BY uploaded_at DESC',
    [caseId]
  );
  return rows;
}

// ── Analytics helpers ─────────────────────────────────────────────────────────

/**
 * countByStatus — Returns { Pending: n, "In Progress": n, … }
 */
export async function countByStatus() {
  const { rows } = await pool.query('SELECT status, COUNT(*) as count FROM cases GROUP BY status');
  return rows.reduce((acc, r) => {
    acc[r.status] = parseInt(r.count, 10);
    return acc;
  }, {});
}

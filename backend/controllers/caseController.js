/**
 * controllers/caseController.js
 */

import { supabaseAdmin } from "../models/supabase.js";
import { getCasesByRole, getDashboardBundle } from "../models/dataStore.js";
import {
  fetchCasesByRoleFromDb,
  fetchDashboardBundleFromDb,
} from "../models/supabaseStore.js";

const safeRole     = (v) => ["citizen","lawyer","judge","clerk"].includes(v) ? v : "citizen";
const safePriority = (v) => ["low","medium","high","urgent"].includes(v) ? v : "medium";
const caseNumber   = () => `CASE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

async function profileById(id) {
  if (!supabaseAdmin || !id) return null;
  const { data } = await supabaseAdmin.from("users").select("*").eq("id", id).maybeSingle();
  return data || null;
}

function missingNotificationsTable(err) {
  return String(err?.message || "").toLowerCase().includes("notifications") &&
         String(err?.message || "").toLowerCase().includes("does not exist");
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

export async function getDashboard(req, res) {
  const role   = safeRole(req.params.role);
  const fromDb = await fetchDashboardBundleFromDb(supabaseAdmin, role);
  return res.json(fromDb || getDashboardBundle(role));
}

export async function getCasesByRoleHandler(req, res) {
  const role   = safeRole(req.params.role);
  const fromDb = await fetchCasesByRoleFromDb(supabaseAdmin, role);
  return res.json({ cases: fromDb || getCasesByRole(role) });
}

export async function getMyCases(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
    const { id } = req.user;

    const { data: rows, error } = await supabaseAdmin
      .from("cases").select("*")
      .or([`citizen_id.eq.${id}`,`assigned_lawyer_id.eq.${id}`,`assigned_judge_id.eq.${id}`,`assigned_clerk_id.eq.${id}`].join(","))
      .order("filed_at", { ascending: false }).limit(200);

    if (error) return res.status(500).json({ error: "Failed to load cases", message: error.message });

    const allIds = [...new Set([
      ...(rows || []).map((r) => r.assigned_lawyer_id),
      ...(rows || []).map((r) => r.citizen_id),
    ].filter(Boolean))];

    const { data: profiles } = allIds.length
      ? await supabaseAdmin.from("users").select("id, name, email").in("id", allIds)
      : { data: [] };

    const byId = new Map((profiles || []).map((u) => [u.id, u]));

    const cases = (rows || []).map((row) => {
      const lawyer  = byId.get(row.assigned_lawyer_id);
      const citizen = byId.get(row.citizen_id);
      return {
        id:          row.case_number || row.id,
        title:       row.title,
        type:        row.case_type || "Other",
        status:      row.status    || "Pending",
        priority:    row.priority  || "medium",
        date:        row.filed_at ? new Date(row.filed_at).toISOString().slice(0, 10) : "",
        lawyer:      lawyer?.name  || lawyer?.email?.split("@")[0]  || row.metadata?.lawyer || "",
        citizen:     citizen?.name || citizen?.email?.split("@")[0] || "",
        requestedBy: citizen?.name || citizen?.email?.split("@")[0] || "",
      };
    });

    return res.json({ cases });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load my cases", message: err.message });
  }
}

export async function submitCaseToLawyer(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const citizenProfile = req.profile;
    if (!citizenProfile)              return res.status(400).json({ error: "Citizen profile not found" });
    if (citizenProfile.role !== "citizen")
      return res.status(403).json({ error: "Only citizens can submit cases" });

    const { title, description, caseType, priority, lawyerId, initialMessage } = req.body;

    const lawyerProfile = await profileById(lawyerId);
    if (!lawyerProfile || lawyerProfile.role !== "lawyer")
      return res.status(400).json({ error: "Invalid lawyer selected" });

    const num = caseNumber();
    const { data: newCase, error: caseErr } = await supabaseAdmin
      .from("cases").insert([{
        case_number:        num,
        title:              title.trim(),
        description:        description.trim(),
        case_type:          caseType.trim(),
        status:             "Pending",
        priority:           safePriority(priority),
        citizen_id:         req.user.id,
        assigned_lawyer_id: lawyerId,
        metadata:           { submitted_to_lawyer: true, submitted_at: new Date().toISOString() },
      }]).select("*").single();

    if (caseErr) return res.status(500).json({ error: "Failed to create case", message: caseErr.message });

    const { data: conv, error: convErr } = await supabaseAdmin
      .from("conversations").insert([{
        subject:    `Case ${newCase.case_number}: ${newCase.title}`,
        case_id:    newCase.id,
        created_by: req.user.id,
      }]).select("*").single();

    if (convErr) return res.status(500).json({ error: "Case created but conversation failed", message: convErr.message });

    await supabaseAdmin.from("conversation_participants").insert([
      { conversation_id: conv.id, user_id: req.user.id, role: "citizen", unread_count: 0 },
      { conversation_id: conv.id, user_id: lawyerId,    role: "lawyer",  unread_count: 1 },
    ]);

    const msg = String(initialMessage || description).trim();
    if (msg) {
      await supabaseAdmin.from("messages").insert([{
        conversation_id: conv.id, sender_id: req.user.id, body: msg,
      }]);
    }

    await notify({
      userId:   lawyerId,
      type:     "new_case",
      title:    "New Case Assigned",
      body:     `${citizenProfile.name || "Citizen"} submitted "${newCase.title}"`,
      metadata: { caseId: newCase.id, caseNumber: newCase.case_number, conversationId: conv.id, fromUserId: req.user.id },
    });

    return res.status(201).json({
      ok: true, case: newCase,
      conversation: {
        id:      conv.id,
        subject: conv.subject,
        lawyer:  { id: lawyerProfile.id, name: lawyerProfile.name || lawyerProfile.email?.split("@")[0] || "Lawyer" },
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to submit case", message: err.message });
  }
}

/**
 * POST /api/cases/:id/status
 * Update case status (lawyer/judge/clerk actions).
 */
export async function updateCaseStatus(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["Pending", "In Progress", "Under Review", "Awaiting Ruling", "Closed", "Resolved", "Rejected"];
    if (!allowed.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` });

    const userId = req.user.id;

    // Load case to verify user is a participant and determine notification target
    const { data: caseRow, error: fetchErr } = await supabaseAdmin
      .from("cases").select("*").eq("id", id).maybeSingle();
    if (fetchErr || !caseRow) return res.status(404).json({ error: "Case not found" });

    const isParticipant =
      caseRow.citizen_id === userId ||
      caseRow.assigned_lawyer_id === userId ||
      caseRow.assigned_judge_id === userId ||
      caseRow.assigned_clerk_id === userId;

    // Also allow service-role admin operations
    if (!isParticipant)
      return res.status(403).json({ error: "You are not a participant in this case" });

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("cases").update({ status }).eq("id", id).select("*").single();
    if (updateErr) return res.status(500).json({ error: "Failed to update case status", message: updateErr.message });

    // Notify citizen if updated by lawyer/judge/clerk
    if (caseRow.citizen_id && caseRow.citizen_id !== userId) {
      await notify({
        userId:   caseRow.citizen_id,
        type:     "case_update",
        title:    "Case Status Updated",
        body:     `Your case "${caseRow.title}" is now: ${status}`,
        metadata: { caseId: id, caseNumber: caseRow.case_number, status },
      });
    }

    // Notify lawyer if updated by citizen/judge/clerk
    if (caseRow.assigned_lawyer_id && caseRow.assigned_lawyer_id !== userId) {
      await notify({
        userId:   caseRow.assigned_lawyer_id,
        type:     "case_update",
        title:    "Case Status Updated",
        body:     `Case "${caseRow.title}" is now: ${status}`,
        metadata: { caseId: id, caseNumber: caseRow.case_number, status },
      });
    }

    return res.json({ ok: true, case: updated });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update case status", message: err.message });
  }
}

import { Router } from "express";
import {
  getDashboard,
  getCasesByRoleHandler,
  getMyCases,
  submitCaseToLawyer,
  updateCaseStatus,
} from "../controllers/caseController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateCaseSubmission } from "../middleware/validate.js";
import { auditLogger } from "../middleware/logger.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

// IMPORTANT: static routes (/me, /dashboard/:role, /submit-to-lawyer) must come
// before the catch-all /:role to avoid incorrect param matching.
router.get("/me",                requireAuth(supabaseAdmin), getMyCases);
router.get("/dashboard/:role",   requireAuth(supabaseAdmin), getDashboard);
router.post("/submit-to-lawyer", requireAuth(supabaseAdmin), validateCaseSubmission, auditLogger, submitCaseToLawyer);
router.post("/:id/status",       requireAuth(supabaseAdmin), auditLogger, updateCaseStatus);
router.get("/:role",             requireAuth(supabaseAdmin), getCasesByRoleHandler);

export default router;

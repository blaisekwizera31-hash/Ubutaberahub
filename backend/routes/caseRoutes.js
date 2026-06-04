import { Router } from "express";
import {
  getDashboard,
  getCasesByRoleHandler,
  getMyCases,
  submitCaseToLawyer,
} from "../controllers/caseController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateCaseSubmission } from "../middleware/validate.js";
import { auditLogger } from "../middleware/logger.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

// IMPORTANT: /me must be declared before /:role to avoid "me" being treated as a role param
router.get("/me",            requireAuth(supabaseAdmin), getMyCases);
router.get("/dashboard/:role", requireAuth(supabaseAdmin), getDashboard);
router.get("/:role",         requireAuth(supabaseAdmin), getCasesByRoleHandler);
router.post("/submit-to-lawyer", requireAuth(supabaseAdmin), validateCaseSubmission, auditLogger, submitCaseToLawyer);

export default router;

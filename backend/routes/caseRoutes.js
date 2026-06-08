import { Router } from "express";
import {
  getDashboard,
  getCasesByRoleHandler,
  getMyCases,
  submitCaseToLawyer,
  getCaseDetails,
  approveCase,
  updateCaseStatus,
} from "../controllers/caseController.js";
import { verifyToken } from "../middleware/auth.js";
import { validateCaseSubmission } from "../middleware/validate.js";
import { auditLogger } from "../middleware/logger.js";
import { uploadCaseEvidence } from "../middleware/upload.js";

const router = Router();

// IMPORTANT: static routes (/me, /dashboard/:role, /submit-to-lawyer) must come
// before the catch-all /:role to avoid incorrect param matching.
router.get("/me",                verifyToken, getMyCases);
router.get("/dashboard/:role",   verifyToken, getDashboard);
router.post(
  "/submit-to-lawyer",
  verifyToken,
  uploadCaseEvidence.array("documents", 10),
  validateCaseSubmission,
  auditLogger,
  submitCaseToLawyer
);
router.get("/:id/details",       verifyToken, getCaseDetails);
router.post("/:id/approve",      verifyToken, auditLogger, approveCase);
router.post("/:id/status",       verifyToken, auditLogger, updateCaseStatus);
router.get("/:role",             verifyToken, getCasesByRoleHandler);

export default router;

import { Router } from "express";
import {
  getDashboard,
  getAllCasesForClerk,
  getSubmittedDocumentsForClerk,
  getCitizenCourtUpdates,
  getCourtAdminQueue,
  assignCaseToJudge,
  getCasesByRoleHandler,
  getMyCases,
  createRegistryCase,
  updateRegistryCase,
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
router.get("/updates",           verifyToken, getCitizenCourtUpdates);
router.get("/admin/queue",       verifyToken, getCourtAdminQueue);
router.post("/admin/assign",     verifyToken, auditLogger, assignCaseToJudge);
router.get("/clerk/all",         verifyToken, getAllCasesForClerk);
router.get("/clerk/documents",   verifyToken, getSubmittedDocumentsForClerk);
router.post(
  "/clerk/register",
  verifyToken,
  uploadCaseEvidence.array("documents", 10),
  auditLogger,
  createRegistryCase
);
router.patch(
  "/clerk/:id",
  verifyToken,
  uploadCaseEvidence.array("documents", 10),
  auditLogger,
  updateRegistryCase
);
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

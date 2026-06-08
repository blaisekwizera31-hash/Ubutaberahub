/**
 * routes/aiLogRoutes.js
 * AI performance logs, audit trails, and chatbot history.
 */

import { Router } from "express";
import {
  createLog,
  getLogs,
  getMyLogs,
  deleteLog,
  purgeLogs,
} from "../controllers/aiLogController.js";
import { verifyToken }       from "../controllers/middleware/auth.js";
import { checkRole }         from "../controllers/middleware/roleChecker.js";
import { auditLogger }       from "../controllers/middleware/logger.js";
import { aiLimiter, createRateLimiter } from "../controllers/middleware/rateLimiter.js";

const router = Router();

// Tighter limiter for log writes (prevents log-flooding abuse)
const logWriteLimiter = createRateLimiter(60, 60_000, "AI log write limit reached.");

// All routes require authentication
router.use(verifyToken);

// ── Any authenticated role ────────────────────────────────────────────────────

// IMPORTANT: /me must come before /:id to avoid "me" matching as an ID param
router.get("/me", aiLimiter, getMyLogs);

router.post("/", logWriteLimiter, auditLogger, createLog);

// ── Staff only (clerk + judge) ────────────────────────────────────────────────
router.get(
  "/",
  checkRole(["clerk", "judge"]),
  createRateLimiter(30, 60_000, "Analytics rate limit reached."),
  getLogs,
);

// ── Judge only (destructive operations) ──────────────────────────────────────
router.delete(
  "/",                      // ?before=ISO  — bulk purge
  checkRole("judge"),
  auditLogger,
  purgeLogs,
);

router.delete(
  "/:id",
  checkRole("judge"),
  auditLogger,
  deleteLog,
);

export default router;

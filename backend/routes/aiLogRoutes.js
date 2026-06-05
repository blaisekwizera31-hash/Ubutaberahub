/**
 * routes/aiLogRoutes.js
 * AI performance logs, audit trails, and chatbot history.
 *
 * Mount:  app.use('/api/ai-logs', aiLogRoutes)
 *
 * Endpoints:
 *   POST   /api/ai-logs           → persist a log entry        [any auth role]
 *   GET    /api/ai-logs/me        → caller's own chat history   [any auth role]
 *   GET    /api/ai-logs           → full paginated log list     [clerk, judge]
 *   DELETE /api/ai-logs           → purge logs before date      [judge]
 *   DELETE /api/ai-logs/:id       → delete a single log entry   [judge]
 */

import { Router } from "express";
import {
  createLog,
  getLogs,
  getMyLogs,
  deleteLog,
  purgeLogs,
} from "../controllers/aiLogController.js";
import { requireAuth }       from "../middleware/auth.js";
import { checkRole }         from "../middleware/roleChecker.js";
import { auditLogger }       from "../middleware/logger.js";
import { aiLimiter, createRateLimiter } from "../middleware/rateLimiter.js";
import { supabaseAdmin }     from "../config/supabase.js";

const router = Router();

// Tighter limiter for log writes (prevents log-flooding abuse)
const logWriteLimiter = createRateLimiter(60, 60_000, "AI log write limit reached.");

// All routes require authentication
router.use(requireAuth(supabaseAdmin));

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

/**
 * routes/hearingRoutes.js
 * Court hearing calendar, room scheduling, and judicial assignments.
 *
 * Mount:  app.use('/api/hearings', hearingRoutes)
 *
 * Endpoints:
 *   GET    /api/hearings           → list hearings (scoped by caller's role)
 *   GET    /api/hearings/rooms     → list courtrooms + availability
 *   GET    /api/hearings/:id       → single hearing
 *   POST   /api/hearings           → schedule a hearing     [clerk, judge]
 *   PATCH  /api/hearings/:id       → update hearing details [clerk, judge]
 *   DELETE /api/hearings/:id       → cancel a hearing       [clerk, judge]
 */

import { Router } from "express";
import {
  getHearings,
  getHearingById,
  scheduleHearing,
  updateHearing,
  cancelHearing,
  getRooms,
} from "../controllers/hearingController.js";
import { requireAuth } from "../middleware/auth.js";
import { checkRole }   from "../middleware/roleChecker.js";
import { auditLogger } from "../middleware/logger.js";
import { validateBody } from "../middleware/validate.js";
import { supabaseAdmin } from "../config/supabase.js";

const router = Router();

// All hearing routes require authentication
router.use(requireAuth(supabaseAdmin));

// ── Read (all authenticated roles) ───────────────────────────────────────────
// IMPORTANT: static paths (/rooms) must come before param paths (/:id)
router.get("/rooms",  getRooms);
router.get("/",       getHearings);
router.get("/:id",    getHearingById);

// ── Write (clerk and judge only) ─────────────────────────────────────────────
router.post(
  "/",
  checkRole(["clerk", "judge"]),
  validateBody(["caseId", "scheduledAt", "judgeId"]),
  auditLogger,
  scheduleHearing,
);

router.patch(
  "/:id",
  checkRole(["clerk", "judge"]),
  auditLogger,
  updateHearing,
);

router.delete(
  "/:id",
  checkRole(["clerk", "judge"]),
  auditLogger,
  cancelHearing,
);

export default router;

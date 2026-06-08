/**
 * routes/hearingRoutes.js
 * Court hearing calendar, room scheduling, and judicial assignments.
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
import { verifyToken } from "../middleware/auth.js";
import { checkRole }   from "../middleware/roleChecker.js";
import { auditLogger } from "../middleware/logger.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

// All hearing routes require authentication
router.use(verifyToken);

// ── Read (all authenticated roles) ───────────────────────────────────────────
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

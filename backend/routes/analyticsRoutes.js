/**
 * routes/analyticsRoutes.js
 * Platform-wide metrics and performance data for the admin dashboard.
 */

import { Router } from "express";
import {
  getOverview,
  getCaseAnalytics,
  getUserAnalytics,
  getHearingAnalytics,
  getAiAnalytics,
} from "../controllers/analyticsController.js";
import { verifyToken } from "../middleware/auth.js";
import { checkRole }   from "../middleware/roleChecker.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Analytics endpoints can be expensive — throttle to 30 req/min per IP
const analyticsLimiter = createRateLimiter(30, 60_000, "Analytics rate limit reached. Please wait a moment.");

// All analytics routes: authenticated + restricted to staff roles
router.use(verifyToken);
router.use(checkRole(["clerk", "judge"]));
router.use(analyticsLimiter);

router.get("/overview",  getOverview);
router.get("/cases",     getCaseAnalytics);
router.get("/users",     getUserAnalytics);
router.get("/hearings",  getHearingAnalytics);
router.get("/ai",        getAiAnalytics);

export default router;

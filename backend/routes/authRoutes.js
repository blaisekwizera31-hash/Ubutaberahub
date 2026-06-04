import { Router } from "express";
import { getSessionUser, syncProfile } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

router.get( "/session-user", requireAuth(supabaseAdmin), getSessionUser);
router.post("/sync-profile",  authLimiter, requireAuth(supabaseAdmin), syncProfile);

export default router;

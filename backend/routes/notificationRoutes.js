import { Router } from "express";
import { getNotifications, markRead } from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

router.get( "/",    requireAuth(supabaseAdmin), getNotifications);
router.post("/read", requireAuth(supabaseAdmin), markRead);

export default router;

import { Router } from "express";
import { getAppointments } from "../controllers/appointmentController.js";
import { requireAuth } from "../middleware/auth.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

router.get("/:role", requireAuth(supabaseAdmin), getAppointments);

export default router;

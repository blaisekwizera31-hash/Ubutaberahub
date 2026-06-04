import { Router } from "express";
import {
  getAppointments,
  getMyAppointments,
  bookAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { requireAuth } from "../middleware/auth.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

// IMPORTANT: /me must come before /:role to avoid "me" being matched as a role param
router.get("/me",          requireAuth(supabaseAdmin), getMyAppointments);
router.post("/",           requireAuth(supabaseAdmin), bookAppointment);
router.patch("/:id/status", requireAuth(supabaseAdmin), updateAppointmentStatus);
router.get("/:role",       requireAuth(supabaseAdmin), getAppointments);

export default router;

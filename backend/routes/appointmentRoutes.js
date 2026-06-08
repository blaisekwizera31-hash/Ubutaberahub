import { Router } from "express";
import {
  getAppointments,
  getMyAppointments,
  bookAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { verifyToken } from "../controllers/middleware/auth.js";

const router = Router();

// IMPORTANT: /me must come before /:role to avoid "me" being matched as a role param
router.get("/me",          verifyToken, getMyAppointments);
router.post("/",           verifyToken, bookAppointment);
router.patch("/:id/status", verifyToken, updateAppointmentStatus);
router.get("/:role",       verifyToken, getAppointments);

export default router;

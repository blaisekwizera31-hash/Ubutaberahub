import { Router } from "express";
import { getLawyers } from "../controllers/lawyerController.js";
import { optionalAuth } from "../middleware/auth.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

router.get("/", optionalAuth(supabaseAdmin), getLawyers);

export default router;

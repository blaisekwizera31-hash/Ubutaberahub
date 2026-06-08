import { Router } from "express";
import { getLawyers } from "../controllers/lawyerController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", optionalAuth, getLawyers);

export default router;

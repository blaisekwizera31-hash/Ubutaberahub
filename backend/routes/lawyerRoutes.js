import { Router } from "express";
import { getLawyers, updateMyLawyerProfile } from "../controllers/lawyerController.js";
import { optionalAuth, verifyToken } from "../middleware/auth.js";

const router = Router();

router.patch("/me", verifyToken, updateMyLawyerProfile);
router.get("/", optionalAuth, getLawyers);

export default router;

import { Router } from "express";
import { getNotifications, markRead } from "../controllers/notificationController.js";
import { verifyToken } from "../controllers/middleware/auth.js";

const router = Router();

router.get( "/",    verifyToken, getNotifications);
router.post("/read", verifyToken, markRead);

export default router;

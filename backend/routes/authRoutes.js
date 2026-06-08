import { Router } from "express";
import { 
  signup, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  getSessionUser, 
  syncProfile,
  resendSignupVerification
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { getMessageUsers } from "../controllers/userController.js";

const router = Router();

// Public routes
router.post("/signup",          authLimiter, signup);
router.post("/login",           authLimiter, login);
router.get( "/verify-email",    authLimiter, verifyEmail);
router.post("/verify-email",    authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password",  authLimiter, resetPassword);
router.post("/resend-verification", authLimiter, resendSignupVerification);

// Protected routes
router.get( "/session-user",    verifyToken, getSessionUser);
router.get( "/message-users",   verifyToken, getMessageUsers);
router.post("/sync-profile",     authLimiter, verifyToken, syncProfile);

export default router;

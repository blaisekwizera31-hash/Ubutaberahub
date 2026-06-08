import { Router } from "express";
import { chat, classifyCase, analyzeDocument, legalGuidance, summarize } from "../controllers/aiController.js";
import { optionalAuth, verifyToken } from "../controllers/middleware/auth.js";
import { aiLimiter } from "../controllers/middleware/rateLimiter.js";
import { validateChatRequest, validateClassifyCase } from "../controllers/middleware/validate.js";

const router = Router();

router.post("/chat",             aiLimiter, optionalAuth, validateChatRequest,  chat);
router.post("/classify-case",    aiLimiter, verifyToken,  validateClassifyCase, classifyCase);
router.post("/analyze-document", aiLimiter, verifyToken,  analyzeDocument);
router.post("/legal-guidance",   aiLimiter, optionalAuth, legalGuidance);
router.post("/summarize",        aiLimiter, optionalAuth, summarize);

export default router;

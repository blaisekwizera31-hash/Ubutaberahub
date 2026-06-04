import { Router } from "express";
import { chat, classifyCase, analyzeDocument, legalGuidance, summarize } from "../controllers/aiController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { validateChatRequest, validateClassifyCase } from "../middleware/validate.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

router.post("/chat",             aiLimiter, optionalAuth(supabaseAdmin), validateChatRequest,  chat);
router.post("/classify-case",    aiLimiter, requireAuth(supabaseAdmin),  validateClassifyCase, classifyCase);
router.post("/analyze-document", aiLimiter, requireAuth(supabaseAdmin),  analyzeDocument);
router.post("/legal-guidance",   aiLimiter, optionalAuth(supabaseAdmin), legalGuidance);
router.post("/summarize",        aiLimiter, optionalAuth(supabaseAdmin), summarize);

export default router;

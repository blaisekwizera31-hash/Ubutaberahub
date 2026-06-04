import { Router } from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  getMessagesByRoleHandler,
  createConversation,
} from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateMessageBody } from "../middleware/validate.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

// IMPORTANT: static routes must come before parameterized ones
router.get("/",                          requireAuth(supabaseAdmin), getConversations);
router.post("/",                         requireAuth(supabaseAdmin), createConversation);
router.get("/role/:role",                requireAuth(supabaseAdmin), getMessagesByRoleHandler);
router.get("/:conversationId/messages",  requireAuth(supabaseAdmin), getMessages);
router.post("/:conversationId/messages", requireAuth(supabaseAdmin), validateMessageBody, sendMessage);

export default router;

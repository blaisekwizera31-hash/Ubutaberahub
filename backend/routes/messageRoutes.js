import { Router } from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  getMessagesByRoleHandler,
} from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateMessageBody } from "../middleware/validate.js";
import { supabaseAdmin } from "../models/supabase.js";

const router = Router();

router.get("/",                                  requireAuth(supabaseAdmin), getConversations);
router.get("/role/:role",                        requireAuth(supabaseAdmin), getMessagesByRoleHandler);
router.get("/:conversationId/messages",          requireAuth(supabaseAdmin), getMessages);
router.post("/:conversationId/messages",         requireAuth(supabaseAdmin), validateMessageBody, sendMessage);

export default router;

import { Router } from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
} from "../controllers/messageController.js";
import { verifyToken } from "../middleware/auth.js";
import { validateMessageBody } from "../middleware/validate.js";

const router = Router();

// IMPORTANT: static routes must come before parameterized ones
router.get("/",                          verifyToken, getConversations);
router.post("/",                         verifyToken, createConversation);
router.get("/:conversationId/messages",  verifyToken, getMessages);
router.post("/:conversationId/messages", verifyToken, validateMessageBody, sendMessage);

export default router;

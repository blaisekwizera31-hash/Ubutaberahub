/**
 * controllers/messageController.js
 */

import * as MessageModel from "../models/messageModel.js";
import * as UserModel from "../models/userModel.js";
import { notify } from "../utils/notify.js";
import { sendRealtimeToUser } from "../utils/realtime.js";

export async function getConversations(req, res) {
  try {
    const conversations = await MessageModel.listConversationsForUser(req.user.id);
    return res.json({ conversations });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load conversations", message: err.message });
  }
}

export async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const { id: userId } = req.user;

    if (!(await MessageModel.isParticipant(conversationId, userId)))
      return res.status(403).json({ error: "Forbidden" });

    const messages = await MessageModel.listMessages(conversationId, userId);
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load messages", message: err.message });
  }
}

export async function sendMessage(req, res) {
  try {
    const { conversationId } = req.params;
    const { id: userId } = req.user;
    const body = req.body.body;

    if (!(await MessageModel.isParticipant(conversationId, userId)))
      return res.status(403).json({ error: "Forbidden" });

    const message = await MessageModel.sendMessage({ conversationId, senderId: userId, body });
    const messageForSender = { ...message, isOwn: true };
    const messageForPeer = { ...message, isOwn: false };

    // Notify peers
    const conv = await MessageModel.findConversationById(conversationId);
    const participantIds = await MessageModel.listParticipantIds(conversationId);
    for (const participantId of participantIds) {
      sendRealtimeToUser(participantId, {
        type: "new_message",
        conversationId,
        message: participantId === userId ? messageForSender : messageForPeer,
      });
    }

    // Find peer ID - simplified for 1:1, for group we'd need more logic
    const conversations = await MessageModel.listConversationsForUser(userId);
    const peer = conversations.find(c => c.id === conversationId);
    
    if (peer && peer.contactId) {
      await notify({
        userId: peer.contactId, 
        type: "new_message", 
        title: "New Message", 
        body,
        metadata: { conversationId, messageId: message.id, fromUserId: userId },
      });
    }

    return res.status(201).json({ message: messageForSender });
  } catch (err) {
    return res.status(500).json({ error: "Failed to send message", message: err.message });
  }
}

export async function createConversation(req, res) {
  try {
    const { id: userId } = req.user;
    const { lawyerId, peerId, subject, caseId, initialMessage } = req.body;
    const recipientId = peerId || lawyerId;

    if (!recipientId) return res.status(400).json({ error: "peerId is required" });

    const peer = await UserModel.findById(recipientId);
    if (!peer) return res.status(400).json({ error: "Recipient not found" });

    let existingId = await MessageModel.findExistingConversation(userId, recipientId, caseId);
    if (!existingId && caseId) {
      existingId = await MessageModel.findExistingConversation(userId, recipientId);
    }
    let conv;

    if (existingId) {
      conv = await MessageModel.findConversationById(existingId);
    } else {
      const convSubject = subject || `Conversation with ${peer.name || peer.email?.split("@")[0] || "Attorney"}`;
      conv = await MessageModel.createConversation(
        { subject: convSubject, caseId: caseId || null, createdBy: userId },
        [
          { userId, role: req.user.role || "citizen" },
          { userId: recipientId, role: peer.role || "participant" }
        ]
      );
    }

    // Send initial message if provided
    if (initialMessage?.trim()) {
      await MessageModel.sendMessage({
        conversationId: conv.id,
        senderId: userId,
        body: initialMessage.trim()
      });
      
      await notify({
        userId: recipientId, 
        type: "new_message", 
        title: "New Message",
        body: initialMessage.trim(),
        metadata: { conversationId: conv.id, fromUserId: userId },
      });
    }

    return res.status(201).json({
      conversation: {
        id:      conv.id,
        subject: conv.subject,
        caseId:  conv.caseId || null,
        contact: peer.name || peer.email?.split("@")[0] || "Contact",
        contactId: peer.id,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create conversation", message: err.message });
  }
}

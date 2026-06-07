/**
 * controllers/aiLogController.js
 * Logs AI performance, audit trails, and chatbot history using PostgreSQL via aiLogModel.
 */

import * as AiLogModel from "../models/aiLogModel.js";

/**
 * POST /api/ai-logs
 */
export async function createLog(req, res) {
  try {
    const {
      action, model, lang, prompt, response,
      tokensUsed, latencyMs, status, errorMessage,
      metadata, includePrompt, includeResponse, sessionId,
    } = req.body;

    if (!action) return res.status(400).json({ error: "action is required" });

    const result = await AiLogModel.insert({
      userId:       req.user?.id || null,
      sessionId:    sessionId   || null,
      action,
      model,
      lang:          lang        || req.lang || "rw",
      prompt,
      response,
      tokensUsed,
      latencyMs,
      status,
      errorMessage,
      metadata,
      storePrompt:   includePrompt,
      storeResponse: includeResponse
    });

    return res.status(201).json({ ok: true, ...result });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save AI log", message: err.message });
  }
}

/**
 * GET /api/ai-logs
 */
export async function getLogs(req, res) {
  try {
    const { limit, offset, action, status, userId, from, to } = req.query;
    const result = await AiLogModel.list({ limit, offset, action, status, userId, from, to });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load AI logs", message: err.message });
  }
}

/**
 * GET /api/ai-logs/me
 */
export async function getMyLogs(req, res) {
  try {
    const { limit, offset, action } = req.query;
    const result = await AiLogModel.listForUser(req.user.id, { limit, offset, action });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load your AI history", message: err.message });
  }
}

/**
 * DELETE /api/ai-logs/:id
 */
export async function deleteLog(req, res) {
  try {
    const { id } = req.params;
    await AiLogModel.deleteById(id);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete log", message: err.message });
  }
}

/**
 * DELETE /api/ai-logs
 */
export async function purgeLogs(req, res) {
  try {
    const { before } = req.query;
    if (!before) return res.status(400).json({ error: "before (ISO date) query param is required" });

    const count = await AiLogModel.purgeBefore(before);
    return res.json({ ok: true, deleted: count });
  } catch (err) {
    return res.status(500).json({ error: "Failed to purge logs", message: err.message });
  }
}

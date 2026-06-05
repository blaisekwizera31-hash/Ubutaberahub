/**
 * controllers/aiLogController.js
 * Logs AI performance, audit trails, and chatbot history.
 *
 * Storage strategy:
 *   Primary  → Supabase `ai_logs` table (always attempted first)
 *   Fallback → in-process memory ring-buffer (when Supabase is unavailable)
 *
 * MongoDB note: if the project later adds a MongoDB connection, swap the
 * `saveFallback` / `readFallback` calls below for your Mongoose model.
 */

import { supabaseAdmin } from "../config/supabase.js";

// ── In-memory fallback (ring buffer, max 500 entries) ─────────────────────────
const RING_MAX = 500;
const memoryLog = [];
function saveFallback(entry) {
  memoryLog.push(entry);
  if (memoryLog.length > RING_MAX) memoryLog.shift();
}
function readFallback({ limit = 50, offset = 0 } = {}) {
  return memoryLog.slice().reverse().slice(offset, offset + limit);
}

// ── Valid action / status enums ───────────────────────────────────────────────
const VALID_ACTIONS = ["chat", "classify_case", "analyze_document", "legal_guidance", "summarize", "other"];
const VALID_STATUSES = ["success", "error", "fallback"];

function safeAction(v) { return VALID_ACTIONS.includes(v)  ? v : "other"; }
function safeStatus(v) { return VALID_STATUSES.includes(v) ? v : "success"; }

function normalizeLog(row) {
  return {
    id:           row.id          || row._id,
    userId:       row.user_id     || null,
    sessionId:    row.session_id  || null,
    action:       row.action,
    model:        row.model       || "gemini",
    lang:         row.lang        || "rw",
    prompt:       row.prompt      || null,    // stored only if includePrompt flag set
    response:     row.response    || null,    // stored only if includeResponse flag set
    tokensUsed:   row.tokens_used || 0,
    latencyMs:    row.latency_ms  || 0,
    status:       row.status,
    errorMessage: row.error_message || null,
    metadata:     row.metadata    || {},
    createdAt:    row.created_at  || row.createdAt,
  };
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/ai-logs
 * Persists an AI interaction log entry.
 * Called internally by aiController after each AI call, but also exposed as an
 * endpoint so the frontend can submit client-side AI events.
 *
 * Body: {
 *   action, model?, lang?, prompt?, response?,
 *   tokensUsed?, latencyMs?, status?, errorMessage?, metadata?,
 *   includePrompt?, includeResponse?, sessionId?
 * }
 */
export async function createLog(req, res) {
  try {
    const userId = req.user?.id || null;

    const {
      action, model, lang, prompt, response,
      tokensUsed, latencyMs, status, errorMessage,
      metadata, includePrompt, includeResponse, sessionId,
    } = req.body;

    if (!action) return res.status(400).json({ error: "action is required" });

    const entry = {
      user_id:       userId,
      session_id:    sessionId   || null,
      action:        safeAction(action),
      model:         model       || "gemini",
      lang:          lang        || req.lang || "rw",
      prompt:        includePrompt  ? (prompt   || null) : null,
      response:      includeResponse ? (response || null) : null,
      tokens_used:   Number(tokensUsed) || 0,
      latency_ms:    Number(latencyMs)  || 0,
      status:        safeStatus(status),
      error_message: errorMessage || null,
      metadata:      metadata    || {},
      created_at:    new Date().toISOString(),
    };

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("ai_logs").insert([entry]).select("*").single();

      if (error) {
        // Table not yet created — fall back to memory
        const m = String(error.message || "").toLowerCase();
        if (m.includes("ai_logs") && m.includes("does not exist")) {
          saveFallback({ id: `mem-${Date.now()}`, ...entry });
          return res.status(201).json({ ok: true, stored: "memory", note: "ai_logs table not yet created" });
        }
        return res.status(500).json({ error: "Failed to save AI log", message: error.message });
      }

      return res.status(201).json({ ok: true, stored: "supabase", log: normalizeLog(data) });
    }

    saveFallback({ id: `mem-${Date.now()}`, ...entry });
    return res.status(201).json({ ok: true, stored: "memory" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save AI log", message: err.message });
  }
}

/**
 * GET /api/ai-logs
 * Returns paginated AI log history.
 * Admin / judge / clerk only (enforced in routes).
 * Query params: ?limit=50&offset=0&action=chat&status=error&userId=uuid&from=ISO&to=ISO
 */
export async function getLogs(req, res) {
  try {
    const { limit = 50, offset = 0, action, status, userId, from, to } = req.query;
    const lim = Math.min(Number(limit) || 50, 200);
    const off = Number(offset) || 0;

    if (supabaseAdmin) {
      let q = supabaseAdmin
        .from("ai_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(off, off + lim - 1);

      if (action && VALID_ACTIONS.includes(action)) q = q.eq("action", action);
      if (status && VALID_STATUSES.includes(status)) q = q.eq("status", status);
      if (userId) q = q.eq("user_id", userId);
      if (from)   q = q.gte("created_at", new Date(from).toISOString());
      if (to)     q = q.lte("created_at", new Date(to).toISOString());

      const { data, error, count } = await q;

      if (error) {
        const m = String(error.message || "").toLowerCase();
        if (m.includes("ai_logs") && m.includes("does not exist")) {
          return res.json({ logs: readFallback({ limit: lim, offset: off }), total: memoryLog.length, stored: "memory" });
        }
        return res.status(500).json({ error: "Failed to load AI logs", message: error.message });
      }

      return res.json({ logs: (data || []).map(normalizeLog), total: count ?? 0, stored: "supabase" });
    }

    // No Supabase — serve from memory
    return res.json({ logs: readFallback({ limit: lim, offset: off }), total: memoryLog.length, stored: "memory" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load AI logs", message: err.message });
  }
}

/**
 * GET /api/ai-logs/me
 * Returns the authenticated user's own AI chat history.
 * Visible to any authenticated role.
 */
export async function getMyLogs(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, action } = req.query;
    const lim = Math.min(Number(limit) || 50, 200);
    const off = Number(offset) || 0;

    if (supabaseAdmin) {
      let q = supabaseAdmin
        .from("ai_logs")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(off, off + lim - 1);

      if (action && VALID_ACTIONS.includes(action)) q = q.eq("action", action);

      const { data, error, count } = await q;

      if (error) {
        const m = String(error.message || "").toLowerCase();
        if (m.includes("ai_logs") && m.includes("does not exist"))
          return res.json({ logs: [], total: 0, note: "ai_logs table not yet created" });
        return res.status(500).json({ error: "Failed to load your AI history", message: error.message });
      }

      return res.json({ logs: (data || []).map(normalizeLog), total: count ?? 0 });
    }

    const mine = memoryLog
      .filter((e) => e.user_id === userId)
      .slice().reverse()
      .slice(off, off + lim);

    return res.json({ logs: mine, total: mine.length, stored: "memory" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load your AI history", message: err.message });
  }
}

/**
 * DELETE /api/ai-logs/:id
 * Removes a specific log entry. Admin only (enforced in routes).
 */
export async function deleteLog(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const { id } = req.params;
    const { error } = await supabaseAdmin.from("ai_logs").delete().eq("id", id);
    if (error) return res.status(500).json({ error: "Failed to delete log", message: error.message });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete log", message: err.message });
  }
}

/**
 * DELETE /api/ai-logs
 * Purges all logs older than `beforeDate` query param. Admin only.
 * Query: ?before=ISO
 */
export async function purgeLogs(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const { before } = req.query;
    if (!before) return res.status(400).json({ error: "before (ISO date) query param is required" });

    const cutoff = new Date(before);
    if (isNaN(cutoff.getTime())) return res.status(400).json({ error: "Invalid date for before param" });

    const { error, count } = await supabaseAdmin
      .from("ai_logs")
      .delete({ count: "exact" })
      .lt("created_at", cutoff.toISOString());

    if (error) return res.status(500).json({ error: "Failed to purge logs", message: error.message });

    return res.json({ ok: true, deleted: count ?? 0 });
  } catch (err) {
    return res.status(500).json({ error: "Failed to purge logs", message: err.message });
  }
}

/**
 * models/aiLogModel.js
 * Records prompt inputs, translated text parameters, model references,
 * and token diagnostics using PostgreSQL.
 */

import pool from "../config/db.js";

// ── Constants ─────────────────────────────────────────────────────────────────

export const AI_ACTIONS = Object.freeze([
  "chat",
  "classify_case",
  "analyze_document",
  "legal_guidance",
  "summarize",
  "translate",
  "speech_to_text",
  "text_to_speech",
  "other",
]);

export const AI_STATUSES = Object.freeze(["success", "error", "fallback"]);

export const AI_LANGS = Object.freeze(["rw", "en", "fr"]);

// ── In-memory ring-buffer fallback ────────────────────────────────────────────

const RING_MAX = 500;
const _ring    = [];

function ringPush(entry) {
  _ring.push(entry);
  if (_ring.length > RING_MAX) _ring.shift();
}

function ringRead({ limit = 50, offset = 0, userId = null, action = null } = {}) {
  let items = _ring.slice().reverse();
  if (userId) items = items.filter((e) => e.user_id === userId);
  if (action) items = items.filter((e) => e.action === action);
  return { data: items.slice(offset, offset + limit), total: items.length };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function safeAction(v) { return AI_ACTIONS.includes(v)  ? v : "other"; }
export function safeStatus(v) { return AI_STATUSES.includes(v) ? v : "success"; }
export function safeLang(v)   { return AI_LANGS.includes(v)    ? v : "rw"; }

function normalize(row) {
  if (!row) return null;
  return {
    id:           row.id,
    userId:       row.user_id       || null,
    sessionId:    row.session_id    || null,
    action:       row.action,
    model:        row.model         || "gemini",
    lang:         row.lang          || "rw",
    prompt:       row.prompt        || null,
    response:     row.response      || null,
    tokensUsed:   row.tokens_used   || 0,
    latencyMs:    row.latency_ms    || 0,
    status:       row.status,
    errorMessage: row.error_message || null,
    metadata:     row.metadata      || {},
    createdAt:    row.created_at,
  };
}

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * insert — Persist one AI interaction log entry.
 */
export async function insert(payload) {
  const entry = {
    user_id:       payload.userId        || null,
    session_id:    payload.sessionId     || null,
    action:        safeAction(payload.action),
    model:         payload.model         || "gemini",
    lang:          safeLang(payload.lang),
    prompt:        payload.storePrompt   ? (payload.prompt   || null) : null,
    response:      payload.storeResponse ? (payload.response || null) : null,
    tokens_used:   Number(payload.tokensUsed)  || 0,
    latency_ms:    Number(payload.latencyMs)   || 0,
    status:        safeStatus(payload.status),
    error_message: payload.errorMessage  || null,
    metadata:      payload.metadata      || {},
  };

  try {
    const query = `
      INSERT INTO ai_logs (
        user_id, session_id, action, model, lang, prompt, response, 
        tokens_used, latency_ms, status, error_message, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *
    `;
    const values = [
      entry.user_id, entry.session_id, entry.action, entry.model, entry.lang, entry.prompt, entry.response,
      entry.tokens_used, entry.latency_ms, entry.status, entry.error_message, entry.metadata
    ];

    const { rows } = await pool.query(query, values);
    return { log: normalize(rows[0]), stored: "db" };
  } catch (err) {
    console.error("[aiLogModel.insert] Fallback to ring-buffer:", err.message);
    const fallbackEntry = { id: `mem-${Date.now()}`, ...entry, created_at: new Date().toISOString() };
    ringPush(fallbackEntry);
    return { log: normalize(fallbackEntry), stored: "memory" };
  }
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * list — Paginated log list with optional filters.
 */
export async function list(opts = {}) {
  const { limit = 50, offset = 0, action, status, userId, from, to } = opts;
  const lim = Math.min(Number(limit) || 50, 200);
  const off = Number(offset) || 0;

  try {
    let query = 'SELECT *, COUNT(*) OVER() as total_count FROM ai_logs WHERE 1=1';
    const values = [];
    let idx = 1;

    if (action && AI_ACTIONS.includes(action)) {
      query += ` AND action = $${idx++}`;
      values.push(action);
    }
    if (status && AI_STATUSES.includes(status)) {
      query += ` AND status = $${idx++}`;
      values.push(status);
    }
    if (userId) {
      query += ` AND user_id = $${idx++}`;
      values.push(userId);
    }
    if (from) {
      query += ` AND created_at >= $${idx++}`;
      values.push(new Date(from).toISOString());
    }
    if (to) {
      query += ` AND created_at <= $${idx++}`;
      values.push(new Date(to).toISOString());
    }

    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(lim, off);

    const { rows } = await pool.query(query, values);
    const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
    
    return { logs: rows.map(normalize), total, stored: "db" };
  } catch (err) {
    const fallback = ringRead({ limit: lim, offset: off, userId, action });
    return { logs: fallback.data.map(normalize), total: fallback.total, stored: "memory" };
  }
}

/**
 * listForUser — A single user's own AI history.
 */
export async function listForUser(userId, opts = {}) {
  return list({ ...opts, userId });
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * deleteById — Remove a single log entry.
 */
export async function deleteById(id) {
  await pool.query('DELETE FROM ai_logs WHERE id = $1', [id]);
  return true;
}

/**
 * purgeBefore — Delete all entries older than `beforeDate`.
 */
export async function purgeBefore(beforeDate) {
  const cutoff = new Date(beforeDate);
  if (isNaN(cutoff.getTime())) throw new Error("[aiLogModel.purgeBefore] Invalid date");

  const { rowCount } = await pool.query('DELETE FROM ai_logs WHERE created_at < $1', [cutoff.toISOString()]);
  return rowCount;
}

// ── Analytics helpers ─────────────────────────────────────────────────────────

/**
 * summarize — Returns aggregate stats for the admin analytics endpoint.
 */
export async function summarize(daysBack = 30) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const { rows } = await pool.query(
      "SELECT action, latency_ms, tokens_used, status, created_at, lang, model FROM ai_logs WHERE created_at >= $1",
      [since.toISOString()]
    );

    const total      = rows.length;
    const succeeded  = rows.filter((r) => r.status === "success").length;
    const failed     = rows.filter((r) => r.status === "error").length;
    const fallbacks  = rows.filter((r) => r.status === "fallback").length;
    const totalTokens = rows.reduce((s, r) => s + (r.tokens_used || 0), 0);
    const avgLatency  = total
      ? Math.round(rows.reduce((s, r) => s + (r.latency_ms || 0), 0) / total)
      : 0;

    const byAction = rows.reduce((acc, r) => { acc[r.action]  = (acc[r.action]  || 0) + 1; return acc; }, {});
    const byLang   = rows.reduce((acc, r) => { acc[r.lang]    = (acc[r.lang]    || 0) + 1; return acc; }, {});
    const byModel  = rows.reduce((acc, r) => { acc[r.model]   = (acc[r.model]   || 0) + 1; return acc; }, {});

    return {
      total, succeeded, failed, fallbacks,
      totalTokens, avgLatencyMs: avgLatency,
      byAction, byLang, byModel,
      periodDays: daysBack,
    };
  } catch (err) {
    return { total: 0, note: "db table not available: " + err.message };
  }
}

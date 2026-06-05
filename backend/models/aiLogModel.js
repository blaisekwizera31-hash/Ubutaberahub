/**
 * models/aiLogModel.js
 * Records prompt inputs, translated text parameters, model references,
 * and token diagnostics directly into Supabase.
 *
 * Table: ai_logs
 *
 * Columns expected:
 *   id, user_id, session_id, action, model, lang,
 *   prompt, response, tokens_used, latency_ms,
 *   status, error_message, metadata, created_at
 *
 * Falls back to an in-process ring buffer when the table doesn't exist yet,
 * so the server never crashes during initial setup.
 */

import { supabaseAdmin } from "../config/supabase.js";

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

function isTableMissing(err) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes("ai_logs") && m.includes("does not exist");
}

function normalize(row) {
  return {
    id:           row.id,
    userId:       row.user_id       || null,
    sessionId:    row.session_id    || null,
    action:       row.action,
    model:        row.model         || "gemini",
    lang:         row.lang          || "rw",
    // Prompt / response stored only when explicitly requested (privacy)
    prompt:       row.prompt        || null,
    response:     row.response      || null,
    tokensUsed:   row.tokens_used   || 0,
    latencyMs:    row.latency_ms    || 0,
    status:       row.status,
    errorMessage: row.error_message || null,
    metadata:     row.metadata      || {},
    createdAt:    row.created_at    || row.createdAt,
  };
}

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * insert — Persist one AI interaction log entry to Supabase.
 * Falls back to the in-memory ring buffer if the table doesn't exist.
 *
 * @param {{
 *   userId?,      sessionId?,   action,       model?,
 *   lang?,        prompt?,      response?,    tokensUsed?,
 *   latencyMs?,   status?,      errorMessage?,metadata?,
 *   storePrompt?, storeResponse?
 * }} payload
 *
 * @returns {{ log: object, stored: 'supabase' | 'memory' }}
 */
export async function insert(payload, db = supabaseAdmin) {
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
    created_at:    new Date().toISOString(),
  };

  if (db) {
    const { data, error } = await db.from("ai_logs").insert([entry]).select("*").single();

    if (!error) return { log: normalize(data), stored: "supabase" };

    if (isTableMissing(error)) {
      const fallbackEntry = { id: `mem-${Date.now()}-${Math.random().toString(36).slice(2)}`, ...entry };
      ringPush(fallbackEntry);
      return { log: normalize(fallbackEntry), stored: "memory", note: "ai_logs table not yet created" };
    }

    throw new Error(`[aiLogModel.insert] ${error.message}`);
  }

  const fallbackEntry = { id: `mem-${Date.now()}`, ...entry };
  ringPush(fallbackEntry);
  return { log: normalize(fallbackEntry), stored: "memory" };
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * list — Paginated log list with optional filters.
 * Used by analyticsController and admin views.
 *
 * @param {{ limit?, offset?, action?, status?, userId?, from?, to? }} opts
 */
export async function list(opts = {}, db = supabaseAdmin) {
  const { limit = 50, offset = 0, action, status, userId, from, to } = opts;
  const lim = Math.min(Number(limit) || 50, 200);
  const off = Number(offset) || 0;

  if (db) {
    let q = db
      .from("ai_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(off, off + lim - 1);

    if (action && AI_ACTIONS.includes(action))  q = q.eq("action", action);
    if (status && AI_STATUSES.includes(status)) q = q.eq("status", status);
    if (userId) q = q.eq("user_id", userId);
    if (from)   q = q.gte("created_at", new Date(from).toISOString());
    if (to)     q = q.lte("created_at", new Date(to).toISOString());

    const { data, error, count } = await q;

    if (!error) return { logs: (data || []).map(normalize), total: count ?? 0, stored: "supabase" };

    if (isTableMissing(error)) {
      const fallback = ringRead({ limit: lim, offset: off, userId, action });
      return { logs: fallback.data.map(normalize), total: fallback.total, stored: "memory" };
    }

    throw new Error(`[aiLogModel.list] ${error.message}`);
  }

  const fallback = ringRead({ limit: lim, offset: off, userId, action });
  return { logs: fallback.data.map(normalize), total: fallback.total, stored: "memory" };
}

/**
 * listForUser — A single user's own AI history.
 *
 * @param {string} userId
 * @param {{ limit?, offset?, action? }} opts
 */
export async function listForUser(userId, opts = {}, db = supabaseAdmin) {
  return list({ ...opts, userId }, db);
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * deleteById — Remove a single log entry. Judge-only action.
 */
export async function deleteById(id, db = supabaseAdmin) {
  if (!db) throw new Error("[aiLogModel.deleteById] Supabase not configured");
  const { error } = await db.from("ai_logs").delete().eq("id", id);
  if (error) throw new Error(`[aiLogModel.deleteById] ${error.message}`);
  return true;
}

/**
 * purgeBefore — Delete all entries older than `beforeDate`. Judge-only action.
 *
 * @param {string|Date} beforeDate  ISO string or Date object
 * @returns {number} count of deleted rows
 */
export async function purgeBefore(beforeDate, db = supabaseAdmin) {
  if (!db) throw new Error("[aiLogModel.purgeBefore] Supabase not configured");

  const cutoff = new Date(beforeDate);
  if (isNaN(cutoff.getTime())) throw new Error("[aiLogModel.purgeBefore] Invalid date");

  const { error, count } = await db
    .from("ai_logs")
    .delete({ count: "exact" })
    .lt("created_at", cutoff.toISOString());

  if (error) throw new Error(`[aiLogModel.purgeBefore] ${error.message}`);
  return count ?? 0;
}

// ── Analytics helpers ─────────────────────────────────────────────────────────

/**
 * summarize — Returns aggregate stats for the admin analytics endpoint.
 *
 * @param {number} daysBack   How many days of history to include (default 30)
 */
export async function summarize(daysBack = 30, db = supabaseAdmin) {
  if (!db) return { total: 0, note: "Supabase not configured" };

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const { data, error } = await db
    .from("ai_logs")
    .select("action, latency_ms, tokens_used, status, created_at, lang, model")
    .gte("created_at", since.toISOString());

  if (error) {
    if (isTableMissing(error)) return { total: 0, note: "ai_logs table not yet created" };
    throw new Error(`[aiLogModel.summarize] ${error.message}`);
  }

  const rows       = data || [];
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
}

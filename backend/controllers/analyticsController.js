/**
 * controllers/analyticsController.js
 * Aggregates platform-wide metrics and performance data for the admin dashboard.
 */

import { supabaseAdmin } from "../config/supabase.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function missingTable(err, tableName) {
  const m = String(err?.message || "").toLowerCase();
  return m.includes(tableName) && m.includes("does not exist");
}

/** Safely query a count; returns 0 if table doesn't exist yet */
async function safeCount(table, filters = {}) {
  if (!supabaseAdmin) return 0;
  let q = supabaseAdmin.from(table).select("id", { count: "exact", head: true });
  for (const [col, val] of Object.entries(filters)) q = q.eq(col, val);
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
}

/** Returns ISO date string for N days ago */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/analytics/overview
 * Returns high-level platform counters for the admin dashboard.
 * Admin / clerk / judge access (enforced in routes via checkRole).
 */
export async function getOverview(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const [
      totalUsers,
      totalCases,
      totalAppointments,
      totalHearings,
      totalMessages,
      activeLawyers,
      pendingCases,
      closedCases,
    ] = await Promise.all([
      safeCount("users"),
      safeCount("cases"),
      safeCount("appointments"),
      safeCount("hearings"),
      safeCount("messages"),
      safeCount("users",   { role: "lawyer" }),
      safeCount("cases",   { status: "Pending" }),
      safeCount("cases",   { status: "Closed" }),
    ]);

    return res.json({
      overview: {
        totalUsers,
        totalCases,
        totalAppointments,
        totalHearings,
        totalMessages,
        activeLawyers,
        pendingCases,
        closedCases,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate overview", message: err.message });
  }
}

/**
 * GET /api/analytics/cases
 * Returns case breakdown by status, type, and trend over the last 30 days.
 */
export async function getCaseAnalytics(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const since30 = daysAgo(30);
    const since7  = daysAgo(7);

    const [
      { data: byStatus, error: e1 },
      { data: byType,   error: e2 },
      { data: recent,   error: e3 },
    ] = await Promise.all([
      supabaseAdmin.from("cases").select("status"),
      supabaseAdmin.from("cases").select("case_type"),
      supabaseAdmin.from("cases").select("filed_at").gte("filed_at", since30),
    ]);

    if (e1 || e2) {
      const err = e1 || e2;
      if (missingTable(err, "cases"))
        return res.json({ cases: {}, note: "cases table not yet created" });
      return res.status(500).json({ error: "Failed to load case analytics", message: err.message });
    }

    // Group by status
    const statusCounts = (byStatus || []).reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    // Group by type
    const typeCounts = (byType || []).reduce((acc, r) => {
      const t = r.case_type || "Other";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    // Daily trend for last 30 days
    const dailyTrend = (recent || []).reduce((acc, r) => {
      const day = r.filed_at ? r.filed_at.slice(0, 10) : "unknown";
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    // Last-7-days count
    const last7Count = (recent || []).filter(
      (r) => r.filed_at && r.filed_at >= since7
    ).length;

    return res.json({
      cases: {
        byStatus:    statusCounts,
        byType:      typeCounts,
        dailyTrend,
        last7Days:   last7Count,
        last30Days:  (recent || []).length,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load case analytics", message: err.message });
  }
}

/**
 * GET /api/analytics/users
 * Returns user breakdown by role and registration trend.
 */
export async function getUserAnalytics(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const since30 = daysAgo(30);

    const [
      { data: allUsers,   error: e1 },
      { data: newUsers,   error: e2 },
    ] = await Promise.all([
      supabaseAdmin.from("users").select("role"),
      supabaseAdmin.from("users").select("created_at").gte("created_at", since30),
    ]);

    if (e1) {
      if (missingTable(e1, "users"))
        return res.json({ users: {}, note: "users table not yet created" });
      return res.status(500).json({ error: "Failed to load user analytics", message: e1.message });
    }

    const byRole = (allUsers || []).reduce((acc, r) => {
      acc[r.role] = (acc[r.role] || 0) + 1;
      return acc;
    }, {});

    const dailyRegistrations = (newUsers || []).reduce((acc, r) => {
      const day = r.created_at ? r.created_at.slice(0, 10) : "unknown";
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      users: {
        total: (allUsers || []).length,
        byRole,
        newLast30Days:    (newUsers || []).length,
        dailyRegistrations,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load user analytics", message: err.message });
  }
}

/**
 * GET /api/analytics/hearings
 * Returns hearing stats: counts by status, upcoming count, and rooms utilisation.
 */
export async function getHearingAnalytics(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const now    = new Date().toISOString();
    const since7 = daysAgo(-7); // 7 days in the future

    const { data, error } = await supabaseAdmin.from("hearings").select("status, room_name, scheduled_at");
    if (error) {
      if (missingTable(error, "hearings"))
        return res.json({ hearings: {}, note: "hearings table not yet created" });
      return res.status(500).json({ error: "Failed to load hearing analytics", message: error.message });
    }

    const byStatus = (data || []).reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const upcoming = (data || []).filter(
      (r) => r.scheduled_at >= now && r.status === "scheduled"
    ).length;

    const roomUsage = (data || []).reduce((acc, r) => {
      const name = r.room_name || "Unassigned";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      hearings: { byStatus, upcoming, roomUsage, total: (data || []).length },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load hearing analytics", message: err.message });
  }
}

/**
 * GET /api/analytics/ai
 * Returns AI usage summary: total calls, tokens used, average response time.
 * Reads from the ai_logs collection (via Supabase or dedicated MongoDB proxy).
 */
export async function getAiAnalytics(req, res) {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const since30 = daysAgo(30);

    const { data, error } = await supabaseAdmin
      .from("ai_logs")
      .select("action, latency_ms, tokens_used, status, created_at")
      .gte("created_at", since30);

    if (error) {
      if (missingTable(error, "ai_logs"))
        return res.json({ ai: { total: 0, note: "ai_logs table not yet created" } });
      return res.status(500).json({ error: "Failed to load AI analytics", message: error.message });
    }

    const rows = data || [];
    const total = rows.length;
    const succeeded = rows.filter((r) => r.status === "success").length;
    const failed    = rows.filter((r) => r.status === "error").length;
    const totalTokens = rows.reduce((s, r) => s + (r.tokens_used || 0), 0);
    const avgLatency  = total
      ? Math.round(rows.reduce((s, r) => s + (r.latency_ms || 0), 0) / total)
      : 0;

    const byAction = rows.reduce((acc, r) => {
      acc[r.action] = (acc[r.action] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      ai: { total, succeeded, failed, totalTokens, avgLatencyMs: avgLatency, byAction, last30Days: total },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load AI analytics", message: err.message });
  }
}

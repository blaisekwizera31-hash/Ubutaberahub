/**
 * controllers/analyticsController.js
 * Aggregates platform-wide metrics and performance data for the admin dashboard using PostgreSQL.
 */

import pool from "../config/db.js";

async function safeCount(table, filters = {}) {
  try {
    let query = `SELECT COUNT(*) FROM ${table} WHERE 1=1`;
    const values = [];
    let idx = 1;

    for (const [col, val] of Object.entries(filters)) {
      query += ` AND ${col} = $${idx++}`;
      values.push(val);
    }

    const { rows } = await pool.query(query, values);
    return parseInt(rows[0].count, 10);
  } catch (err) {
    return 0;
  }
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/**
 * GET /api/analytics/overview
 */
export async function getOverview(req, res) {
  try {
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
 */
export async function getCaseAnalytics(req, res) {
  try {
    const since30 = daysAgo(30);
    const since7  = daysAgo(7);

    const { rows: cases } = await pool.query("SELECT status, case_type, filed_at FROM cases");
    const recent = cases.filter(c => c.filed_at && new Date(c.filed_at) >= new Date(since30));

    const statusCounts = cases.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const typeCounts = cases.reduce((acc, r) => {
      const t = r.case_type || "Other";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    const dailyTrend = recent.reduce((acc, r) => {
      const day = new Date(r.filed_at).toISOString().slice(0, 10);
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    const last7Count = recent.filter(r => new Date(r.filed_at) >= new Date(since7)).length;

    return res.json({
      cases: {
        byStatus:    statusCounts,
        byType:      typeCounts,
        dailyTrend,
        last7Days:   last7Count,
        last30Days:  recent.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load case analytics", message: err.message });
  }
}

/**
 * GET /api/analytics/users
 */
export async function getUserAnalytics(req, res) {
  try {
    const since30 = daysAgo(30);

    const { rows: allUsers } = await pool.query("SELECT role, created_at FROM users");
    const newUsers = allUsers.filter(u => u.created_at && new Date(u.created_at) >= new Date(since30));

    const byRole = allUsers.reduce((acc, r) => {
      acc[r.role] = (acc[r.role] || 0) + 1;
      return acc;
    }, {});

    const dailyRegistrations = newUsers.reduce((acc, r) => {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      users: {
        total: allUsers.length,
        byRole,
        newLast30Days:    newUsers.length,
        dailyRegistrations,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load user analytics", message: err.message });
  }
}

/**
 * GET /api/analytics/hearings
 */
export async function getHearingAnalytics(req, res) {
  try {
    const now = new Date().toISOString();

    const { rows: data } = await pool.query("SELECT status, room_name, scheduled_at FROM hearings");

    const byStatus = data.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const upcoming = data.filter(
      (r) => r.scheduled_at && new Date(r.scheduled_at) >= new Date() && r.status === "scheduled"
    ).length;

    const roomUsage = data.reduce((acc, r) => {
      const name = r.room_name || "Unassigned";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      hearings: { byStatus, upcoming, roomUsage, total: data.length },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load hearing analytics", message: err.message });
  }
}

/**
 * GET /api/analytics/ai
 */
export async function getAiAnalytics(req, res) {
  try {
    const since30 = daysAgo(30);

    const { rows } = await pool.query(
      "SELECT action, latency_ms, tokens_used, status, created_at FROM ai_logs WHERE created_at >= $1",
      [since30]
    );

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

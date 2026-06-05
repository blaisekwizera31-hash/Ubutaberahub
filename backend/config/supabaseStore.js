/**
 * config/supabaseStore.js
 * Database query helpers — all Supabase reads/writes live here
 *
 * Structure:
 *   Auth        — fetchUserByIdFromDb, fetchUserByEmailFromDb
 *   Lawyers     — fetchLawyersFromDb
 *   Cases       — fetchCasesByRoleFromDb
 *   Appointments— fetchAppointmentsByRoleFromDb
 *   Messages    — fetchMessagesByRoleFromDb
 *   Notifications— fetchNotificationsFromDb, markNotificationReadInDb
 *   Hearings    — fetchHearingsFromDb
 *   Analytics   — fetchAnalyticsFromDb
 *   AI Logs     — saveAiLogToDb, fetchAiLogsFromDb
 *   Dashboard   — fetchDashboardBundleFromDb
 */

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizeCaseRow(row) {
  return {
    id:       row.case_number || row.id,
    title:    row.title,
    type:     row.case_type || "Other",
    status:   row.status    || "Pending",
    priority: row.priority  || "medium",
    date:     row.filed_at ? new Date(row.filed_at).toISOString().slice(0, 10) : "",
    lawyer:   row.metadata?.lawyer || "",
    ownerId:  row.citizen_id || null,
    parties:  row.metadata?.parties || "",
  };
}

function normalizeAppointmentRow(row) {
  const iso = row.starts_at ? new Date(row.starts_at) : new Date();
  return {
    id:       row.id,
    lawyer:   row.metadata?.lawyer || "Lawyer",
    type:     row.appointment_type || "Consultation",
    date:     iso.toISOString().slice(0, 10),
    time:     iso.toISOString().slice(11, 16),
    duration: `${row.duration_minutes || 30} min`,
    status:   row.status  || "pending",
    caseId:   row.case_id || null,
    isVideo:  row.mode === "video",
  };
}

function normalizeHearingRow(row) {
  const iso = row.scheduled_at ? new Date(row.scheduled_at) : new Date();
  return {
    id:        row.id,
    caseId:    row.case_id   || null,
    judgeId:   row.judge_id  || null,
    lawyerId:  row.lawyer_id || null,
    clerkId:   row.clerk_id  || null,
    title:     row.title     || "Hearing",
    type:      row.hearing_type || "General",
    status:    row.status    || "scheduled",
    date:      iso.toISOString().slice(0, 10),
    time:      iso.toISOString().slice(11, 16),
    location:  row.location  || row.metadata?.location || "",
    isVirtual: row.mode === "virtual",
    notes:     row.notes     || "",
  };
}

function normalizeNotificationRow(row) {
  return {
    id:        row.id,
    userId:    row.user_id,
    title:     row.title   || "Notification",
    message:   row.message || row.body || "",
    type:      row.type    || "info",
    read:      row.read    || false,
    readAt:    row.read_at || null,
    createdAt: row.created_at,
  };
}

function normalizeUserRow(row) {
  return {
    id:        row.id,
    name:      row.name  || row.email?.split("@")[0] || "User",
    email:     row.email || null,
    role:      row.role  || "citizen",
    verified:  row.is_verified || row.verified || false,
    createdAt: row.created_at,
    avatarUrl: row.avatar_url  || null,
    phone:     row.phone       || null,
    location:  row.location    || "Rwanda",
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function fetchUserByIdFromDb(db, userId) {
  if (!db || !userId) return null;
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return normalizeUserRow(data);
}

export async function fetchUserByEmailFromDb(db, email) {
  if (!db || !email) return null;
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();
  if (error) return null;
  return normalizeUserRow(data);
}

export async function updateUserInDb(db, userId, updates) {
  if (!db || !userId) return null;
  const { data, error } = await db
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) return null;
  return normalizeUserRow(data);
}

// ── Lawyers ───────────────────────────────────────────────────────────────────

export async function fetchLawyersFromDb(db) {
  if (!db) return [];

  const { data: users, error } = await db
    .from("users")
    .select("*")
    .eq("role", "lawyer")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !users?.length) return [];

  const userIds = users.map((u) => u.id).filter(Boolean);
  let directoryByUserId = new Map();

  if (userIds.length) {
    const { data: rows, error: de } = await db
      .from("lawyers")
      .select("*")
      .in("user_id", userIds);
    if (!de && Array.isArray(rows)) {
      directoryByUserId = new Map(rows.map((r) => [r.user_id, r]));
    }
  }

  const flag = (v) =>
    v === true ||
    (typeof v === "string" &&
      ["true", "yes", "approved", "verified"].includes(v.trim().toLowerCase()));

  const approved = (u, d) =>
    flag(u?.is_verified)   || flag(u?.verified)   || flag(u?.is_approved) || flag(u?.approved) ||
    flag(d?.is_verified)   || flag(d?.verified)   || flag(d?.is_approved) || flag(d?.approved) ||
    ["verified", "approved"].includes(String(u?.verification_status || "").toLowerCase()) ||
    ["verified", "approved"].includes(String(d?.verification_status || "").toLowerCase()) ||
    !!u?.approved_at || !!d?.approved_at;

  const hasLicense = (u) => String(u?.license_number || "").trim().length >= 4;

  return users
    .map((u) => {
      const d   = directoryByUserId.get(u.id);
      const raw = d?.specialization ?? u.specialization;
      const specialization = Array.isArray(raw)
        ? raw
        : typeof raw === "string" && raw.trim()
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      return {
        id:             u.id,
        name:           d?.display_name || u.name || u.email?.split("@")[0] || "Lawyer",
        email:          u.email         || null,
        specialization,
        experience:     Number(d?.years_experience ?? u.years_experience ?? 0),
        rating:         Number(d?.rating            ?? 0),
        reviews:        Number(d?.reviews_count      ?? 0),
        location:       d?.location || u.law_firm    || "Rwanda",
        hourlyRate:     Number(d?.hourly_rate        ?? 50000),
        available:      d?.is_available !== false,
        verified:       approved(u, d),
        hasLicense:     hasLicense(u),
      };
    })
    .filter((l) => l.hasLicense && l.verified);
}

// ── Cases ─────────────────────────────────────────────────────────────────────

export async function fetchCasesByRoleFromDb(db, role, userId = null) {
  if (!db) return null;
  let q = db
    .from("cases")
    .select("*")
    .order("filed_at", { ascending: false })
    .limit(100);

  if (userId) {
    if (role === "citizen") q = q.eq("citizen_id",          userId);
    if (role === "lawyer")  q = q.eq("assigned_lawyer_id",  userId);
    if (role === "judge")   q = q.eq("assigned_judge_id",   userId);
    if (role === "clerk")   q = q.eq("assigned_clerk_id",   userId);
  } else {
    if (role === "citizen") q = q.not("citizen_id",         "is", null);
    if (role === "lawyer")  q = q.not("assigned_lawyer_id", "is", null);
    if (role === "judge")   q = q.not("assigned_judge_id",  "is", null);
    if (role === "clerk")   q = q.not("assigned_clerk_id",  "is", null);
  }

  const { data, error } = await q;
  if (error) return null;
  return (data || []).map(normalizeCaseRow);
}

export async function fetchCaseByIdFromDb(db, caseId) {
  if (!db || !caseId) return null;
  const { data, error } = await db
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();
  if (error) return null;
  return normalizeCaseRow(data);
}

export async function updateCaseInDb(db, caseId, updates) {
  if (!db || !caseId) return null;
  const { data, error } = await db
    .from("cases")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", caseId)
    .select()
    .single();
  if (error) return null;
  return normalizeCaseRow(data);
}

// ── Appointments ──────────────────────────────────────────────────────────────

export async function fetchAppointmentsByRoleFromDb(db, role, userId = null) {
  if (!db) return null;
  let q = db
    .from("appointments")
    .select("*")
    .order("starts_at", { ascending: true })
    .limit(100);

  if (userId) {
    if (role === "citizen") q = q.eq("citizen_id", userId);
    if (role === "lawyer")  q = q.eq("lawyer_id",  userId);
    if (role === "judge")   q = q.eq("judge_id",   userId);
    if (role === "clerk")   q = q.eq("clerk_id",   userId);
  } else {
    if (role === "citizen") q = q.not("citizen_id", "is", null);
    if (role === "lawyer")  q = q.not("lawyer_id",  "is", null);
    if (role === "judge")   q = q.not("judge_id",   "is", null);
    if (role === "clerk")   q = q.not("clerk_id",   "is", null);
  }

  const { data, error } = await q;
  if (error) return null;
  return (data || []).map(normalizeAppointmentRow);
}

export async function fetchAppointmentByIdFromDb(db, appointmentId) {
  if (!db || !appointmentId) return null;
  const { data, error } = await db
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .single();
  if (error) return null;
  return normalizeAppointmentRow(data);
}

export async function updateAppointmentInDb(db, appointmentId, updates) {
  if (!db || !appointmentId) return null;
  const { data, error } = await db
    .from("appointments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", appointmentId)
    .select()
    .single();
  if (error) return null;
  return normalizeAppointmentRow(data);
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function fetchMessagesByRoleFromDb(db, role) {
  if (!db) return null;
  const { data, error } = await db
    .from("messages")
    .select("id, body, created_at, conversation_id")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data?.length) return [];
  return data.slice(0, 20).map((m) => ({
    id:          m.id,
    contact:     `${role.toUpperCase()} Contact`,
    role,
    lastMessage: m.body,
    time:        m.created_at,
    unread:      0,
    online:      false,
  }));
}

export async function fetchMessagesByConversationFromDb(db, conversationId) {
  if (!db || !conversationId) return [];
  const { data, error } = await db
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) return [];
  return data || [];
}

export async function saveMessageToDb(db, message) {
  if (!db) return null;
  const { data, error } = await db
    .from("messages")
    .insert({
      conversation_id: message.conversationId,
      sender_id:       message.senderId,
      body:            message.body,
      created_at:      new Date().toISOString(),
    })
    .select()
    .single();
  if (error) return null;
  return data;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function fetchNotificationsFromDb(db, userId) {
  if (!db || !userId) return [];
  const { data, error } = await db
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return (data || []).map(normalizeNotificationRow);
}

export async function markNotificationReadInDb(db, notificationId) {
  if (!db || !notificationId) return false;
  const { error } = await db
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId);
  return !error;
}

export async function markAllNotificationsReadInDb(db, userId) {
  if (!db || !userId) return false;
  const { error } = await db
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("read", false);
  return !error;
}

// ── Hearings ──────────────────────────────────────────────────────────────────

export async function fetchHearingsFromDb(db, userId = null, role = null) {
  if (!db) return [];
  let q = db
    .from("hearings")
    .select("*")
    .order("scheduled_at", { ascending: true })
    .limit(100);

  if (userId && role) {
    if (role === "judge")   q = q.eq("judge_id",  userId);
    if (role === "lawyer")  q = q.eq("lawyer_id", userId);
    if (role === "clerk")   q = q.eq("clerk_id",  userId);
    if (role === "citizen") q = q.eq("citizen_id", userId);
  }

  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(normalizeHearingRow);
}

export async function fetchHearingByIdFromDb(db, hearingId) {
  if (!db || !hearingId) return null;
  const { data, error } = await db
    .from("hearings")
    .select("*")
    .eq("id", hearingId)
    .single();
  if (error) return null;
  return normalizeHearingRow(data);
}

export async function updateHearingInDb(db, hearingId, updates) {
  if (!db || !hearingId) return null;
  const { data, error } = await db
    .from("hearings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", hearingId)
    .select()
    .single();
  if (error) return null;
  return normalizeHearingRow(data);
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function fetchAnalyticsFromDb(db) {
  if (!db) return null;

  const [casesRes, appointmentsRes, usersRes, hearingsRes] = await Promise.all([
    db.from("cases").select("status, priority, filed_at, case_type"),
    db.from("appointments").select("status, starts_at, appointment_type"),
    db.from("users").select("role, created_at, is_verified"),
    db.from("hearings").select("status, scheduled_at"),
  ]);

  if (casesRes.error || appointmentsRes.error || usersRes.error) return null;

  const cases        = casesRes.data        || [];
  const appointments = appointmentsRes.data || [];
  const users        = usersRes.data        || [];
  const hearings     = hearingsRes.data     || [];

  return {
    cases: {
      total:    cases.length,
      pending:  cases.filter((c) => /pending/i.test(c.status)).length,
      resolved: cases.filter((c) => /closed|resolved|completed/i.test(c.status)).length,
      high:     cases.filter((c) => ["high", "urgent"].includes(c.priority)).length,
      byType:   cases.reduce((acc, c) => {
        acc[c.case_type || "Other"] = (acc[c.case_type || "Other"] || 0) + 1;
        return acc;
      }, {}),
    },
    appointments: {
      total:    appointments.length,
      upcoming: appointments.filter((a) => new Date(a.starts_at) > new Date()).length,
      completed: appointments.filter((a) => /completed|done/i.test(a.status)).length,
    },
    hearings: {
      total:     hearings.length,
      scheduled: hearings.filter((h) => /scheduled/i.test(h.status)).length,
      completed: hearings.filter((h) => /completed|done/i.test(h.status)).length,
    },
    users: {
      total:    users.length,
      lawyers:  users.filter((u) => u.role === "lawyer").length,
      citizens: users.filter((u) => u.role === "citizen").length,
      judges:   users.filter((u) => u.role === "judge").length,
      clerks:   users.filter((u) => u.role === "clerk").length,
      verified: users.filter((u) => u.is_verified).length,
    },
  };
}

// ── AI Logs ───────────────────────────────────────────────────────────────────

export async function saveAiLogToDb(db, log) {
  if (!db) return null;
  const { data, error } = await db
    .from("ai_logs")
    .insert({
      user_id:     log.userId     || null,
      prompt:      log.prompt,
      response:    log.response,
      model:       log.model,
      latency_ms:  log.latencyMs  || 0,
      tokens_used: log.tokensUsed || 0,
      created_at:  new Date().toISOString(),
    })
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function fetchAiLogsFromDb(db, userId = null) {
  if (!db) return [];
  let q = db
    .from("ai_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (userId) q = q.eq("user_id", userId);

  const { data, error } = await q;
  if (error) return [];
  return data || [];
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchDashboardBundleFromDb(db, role, userId = null) {
  const [cases, appointments, messages, hearings, notifications] = await Promise.all([
    fetchCasesByRoleFromDb(db, role, userId),
    fetchAppointmentsByRoleFromDb(db, role, userId),
    fetchMessagesByRoleFromDb(db, role),
    fetchHearingsFromDb(db, userId, role),
    userId ? fetchNotificationsFromDb(db, userId) : Promise.resolve([]),
  ]);

  if (!cases || !appointments || !messages) return null;

  return {
    stats: {
      totalCases:    cases.length,
      highPriority:  cases.filter((c) => ["high", "urgent"].includes(c.priority)).length,
      pending:       cases.filter((c) => /pending|awaiting|review/i.test(c.status)).length,
      resolved:      cases.filter((c) => /closed|completed|resolved/i.test(c.status)).length,
      upcomingHearings: hearings.filter((h) => new Date(`${h.date}T${h.time}`) > new Date()).length,
      unreadNotifications: notifications.filter((n) => !n.read).length,
    },
    cases,
    appointments,
    messages,
    hearings,
    notifications,
  };
}
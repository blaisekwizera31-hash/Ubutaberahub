/**
 * config/dbStore.js (formerly supabaseStore.js)
 * Database query helpers using PostgreSQL pool.
 */

import pool from "./db.js";

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizeCaseRow(row) {
  if (!row) return null;
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
  if (!row) return null;
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
  if (!row) return null;
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
  if (!row) return null;
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
  if (!row) return null;
  return {
    id:        row.id,
    name:      row.name  || row.email?.split("@")[0] || "User",
    email:     row.email || null,
    role:      row.role  || "citizen",
    verified:  row.is_verified || false,
    createdAt: row.created_at,
    avatarUrl: row.profile_photo || null,
    phone:     row.phone       || null,
    location:  row.location    || "Rwanda",
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function fetchUserByIdFromDb(userId) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return normalizeUserRow(rows[0]);
}

export async function fetchUserByEmailFromDb(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  return normalizeUserRow(rows[0]);
}

export async function updateUserInDb(userId, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, val] of Object.entries(updates)) {
    fields.push(`${key} = $${idx++}`);
    values.push(val);
  }

  if (fields.length === 0) return fetchUserByIdFromDb(userId);

  fields.push(`updated_at = NOW()`);
  values.push(userId);
  
  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(query, values);
  return normalizeUserRow(rows[0]);
}

// ── Lawyers ───────────────────────────────────────────────────────────────────

export async function fetchLawyersFromDb() {
  const { rows: users } = await pool.query(
    "SELECT * FROM users WHERE role = 'lawyer' ORDER BY created_at DESC LIMIT 100"
  );

  if (!users?.length) return [];

  return users.map((u) => ({
    id:             u.id,
    name:           u.name || u.email?.split("@")[0] || "Lawyer",
    email:          u.email         || null,
    specialization: u.specialization || [],
    experience:     Number(u.years_experience ?? 0),
    rating:         Number(u.rating ?? 0),
    reviews:        Number(u.reviews_count ?? 0),
    location:       u.law_firm || "Rwanda",
    hourlyRate:     Number(u.hourly_rate ?? 50000),
    available:      u.is_available !== false,
    verified:       u.is_verified === true,
    hasLicense:     String(u.license_number || "").trim().length >= 4,
  })).filter(l => l.verified);
}

// ── Cases ─────────────────────────────────────────────────────────────────────

export async function fetchCasesByRoleFromDb(role, userId = null) {
  let query = 'SELECT * FROM cases';
  const values = [];

  if (userId) {
    if (role === "citizen") { query += ' WHERE citizen_id = $1'; values.push(userId); }
    else if (role === "lawyer")  { query += ' WHERE assigned_lawyer_id = $1'; values.push(userId); }
    else if (role === "judge")   { query += ' WHERE assigned_judge_id = $1'; values.push(userId); }
    else if (role === "clerk")   { query += ' WHERE assigned_clerk_id = $1'; values.push(userId); }
  } else {
    if (role === "citizen") query += ' WHERE citizen_id IS NOT NULL';
    else if (role === "lawyer")  query += ' WHERE assigned_lawyer_id IS NOT NULL';
    else if (role === "judge")   query += ' WHERE assigned_judge_id IS NOT NULL';
    else if (role === "clerk")   query += ' WHERE assigned_clerk_id IS NOT NULL';
  }

  query += ' ORDER BY filed_at DESC LIMIT 100';
  const { rows } = await pool.query(query, values);
  return rows.map(normalizeCaseRow);
}

export async function fetchCaseByIdFromDb(caseId) {
  const { rows } = await pool.query('SELECT * FROM cases WHERE id = $1', [caseId]);
  return normalizeCaseRow(rows[0]);
}

export async function updateCaseInDb(caseId, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, val] of Object.entries(updates)) {
    fields.push(`${key} = $${idx++}`);
    values.push(val);
  }

  fields.push(`updated_at = NOW()`);
  values.push(caseId);

  const query = `UPDATE cases SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(query, values);
  return normalizeCaseRow(rows[0]);
}

// ── Appointments ──────────────────────────────────────────────────────────────

export async function fetchAppointmentsByRoleFromDb(role, userId = null) {
  let query = 'SELECT * FROM appointments';
  const values = [];

  if (userId) {
    if (role === "citizen") { query += ' WHERE citizen_id = $1'; values.push(userId); }
    else if (role === "lawyer")  { query += ' WHERE lawyer_id = $1'; values.push(userId); }
    else if (role === "judge")   { query += ' WHERE judge_id = $1'; values.push(userId); }
    else if (role === "clerk")   { query += ' WHERE clerk_id = $1'; values.push(userId); }
  }

  query += ' ORDER BY starts_at ASC LIMIT 100';
  const { rows } = await pool.query(query, values);
  return rows.map(normalizeAppointmentRow);
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function fetchMessagesByRoleFromDb(role) {
  const { rows } = await pool.query(
    "SELECT id, body, created_at, conversation_id FROM messages ORDER BY created_at DESC LIMIT 20"
  );
  return rows.map((m) => ({
    id:          m.id,
    contact:     `${role.toUpperCase()} Contact`,
    role,
    lastMessage: m.body,
    time:        m.created_at,
    unread:      0,
    online:      false,
  }));
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function fetchNotificationsFromDb(userId) {
  const { rows } = await pool.query(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
    [userId]
  );
  return rows.map(normalizeNotificationRow);
}

export async function markNotificationReadInDb(notificationId) {
  await pool.query("UPDATE notifications SET read = true, read_at = NOW() WHERE id = $1", [notificationId]);
  return true;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchDashboardBundleFromDb(role, userId = null) {
  const [cases, appointments, messages, notifications] = await Promise.all([
    fetchCasesByRoleFromDb(role, userId),
    fetchAppointmentsByRoleFromDb(role, userId),
    fetchMessagesByRoleFromDb(role),
    userId ? fetchNotificationsFromDb(userId) : Promise.resolve([]),
  ]);

  return {
    stats: {
      totalCases:    cases.length,
      highPriority:  cases.filter((c) => ["high", "urgent"].includes(c.priority)).length,
      pending:       cases.filter((c) => /pending|awaiting|review/i.test(c.status)).length,
      resolved:      cases.filter((c) => /closed|completed|resolved/i.test(c.status)).length,
      unreadNotifications: notifications.filter((n) => !n.read).length,
    },
    cases,
    appointments,
    messages,
    notifications,
  };
}

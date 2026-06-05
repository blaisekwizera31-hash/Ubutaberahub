/**
 * models/supabaseStore.js
 * Database query helpers — all Supabase reads/writes live here
 */

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
    flag(u?.is_verified) || flag(u?.verified) || flag(u?.is_approved) || flag(u?.approved) ||
    flag(d?.is_verified) || flag(d?.verified) || flag(d?.is_approved) || flag(d?.approved) ||
    ["verified", "approved"].includes(String(u?.verification_status || "").toLowerCase()) ||
    ["verified", "approved"].includes(String(d?.verification_status || "").toLowerCase()) ||
    !!u?.approved_at || !!d?.approved_at;

  const hasLicense = (u) => String(u?.license_number || "").trim().length >= 4;

  return users
    .map((u) => {
      const d = directoryByUserId.get(u.id);
      const raw = d?.specialization ?? u.specialization;
      const specialization = Array.isArray(raw)
        ? raw
        : typeof raw === "string" && raw.trim()
        ? raw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      return {
        id:          u.id,
        name:        d?.display_name || u.name || u.email?.split("@")[0] || "Lawyer",
        email:       u.email || null,
        specialization,
        experience:  Number(d?.years_experience ?? u.years_experience ?? 0),
        rating:      Number(d?.rating ?? 0),
        reviews:     Number(d?.reviews_count ?? 0),
        location:    d?.location || u.law_firm || "Rwanda",
        hourlyRate:  Number(d?.hourly_rate ?? 50000),
        available:   d?.is_available !== false,
        verified:    approved(u, d),
        hasLicense:  hasLicense(u),
      };
    })
    .filter((l) => l.hasLicense && l.verified);
}

export async function fetchCasesByRoleFromDb(db, role, userId = null) {
  if (!db) return null;
  let q = db.from("cases").select("*").order("filed_at", { ascending: false }).limit(100);

  // Scope to the specific user when a userId is provided (preferred).
  // Falls back to "column not null" for generic role-based list pages.
  if (userId) {
    if (role === "citizen") q = q.eq("citizen_id",          userId);
    else if (role === "lawyer")  q = q.eq("assigned_lawyer_id", userId);
    else if (role === "judge")   q = q.eq("assigned_judge_id",  userId);
    else if (role === "clerk")   q = q.eq("assigned_clerk_id",  userId);
  } else {
    if (role === "citizen") q = q.not("citizen_id",          "is", null);
    if (role === "lawyer")  q = q.not("assigned_lawyer_id",  "is", null);
    if (role === "judge")   q = q.not("assigned_judge_id",   "is", null);
    if (role === "clerk")   q = q.not("assigned_clerk_id",   "is", null);
  }

  const { data, error } = await q;
  if (error) return null;
  return (data || []).map(normalizeCaseRow);
}

export async function fetchAppointmentsByRoleFromDb(db, role, userId = null) {
  if (!db) return null;
  let q = db.from("appointments").select("*").order("starts_at", { ascending: true }).limit(100);

  if (userId) {
    if (role === "citizen") q = q.eq("citizen_id", userId);
    else if (role === "lawyer")  q = q.eq("lawyer_id",  userId);
    else if (role === "judge")   q = q.eq("judge_id",   userId);
    else if (role === "clerk")   q = q.eq("clerk_id",   userId);
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

export async function fetchDashboardBundleFromDb(db, role, userId = null) {
  const [cases, appointments, messages] = await Promise.all([
    fetchCasesByRoleFromDb(db, role, userId),
    fetchAppointmentsByRoleFromDb(db, role, userId),
    fetchMessagesByRoleFromDb(db, role),
  ]);
  if (!cases || !appointments || !messages) return null;
  return {
    stats: {
      totalCases:   cases.length,
      highPriority: cases.filter((c) => ["high","urgent"].includes(c.priority)).length,
      pending:      cases.filter((c) => /pending|awaiting|review/i.test(c.status)).length,
      resolved:     cases.filter((c) => /closed|completed|resolved/i.test(c.status)).length,
    },
    cases,
    appointments,
    messages,
  };
}

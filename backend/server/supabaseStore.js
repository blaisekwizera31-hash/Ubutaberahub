function normalizeCaseRow(row) {
  return {
    id: row.case_number || row.id,
    title: row.title,
    type: row.case_type || "Other",
    status: row.status || "Pending",
    priority: row.priority || "medium",
    date: row.filed_at ? new Date(row.filed_at).toISOString().slice(0, 10) : "",
    lawyer: row.metadata?.lawyer || "",
    ownerId: row.citizen_id || null,
    parties: row.metadata?.parties || "",
  };
}

function normalizeAppointmentRow(row) {
  const iso = row.starts_at ? new Date(row.starts_at) : new Date();
  return {
    id: row.id,
    lawyer: row.metadata?.lawyer || "Lawyer",
    type: row.appointment_type || "Consultation",
    date: iso.toISOString().slice(0, 10),
    time: iso.toISOString().slice(11, 16),
    duration: `${row.duration_minutes || 30} min`,
    status: row.status || "pending",
    caseId: row.case_id || null,
    isVideo: row.mode === "video",
  };
}

export async function fetchLawyersFromDb(supabaseAdmin) {
  if (!supabaseAdmin) return [];

  // Source of truth: signed-up users with role "lawyer".
  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("role", "lawyer")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return [];
  if (!users || users.length === 0) return [];

  // Optional enrichment from the dedicated lawyers directory when available.
  const userIds = users.map((u) => u.id).filter(Boolean);
  let directoryByUserId = new Map();
  if (userIds.length > 0) {
    const { data: directoryRows, error: directoryError } = await supabaseAdmin
      .from("lawyers")
      .select("*")
      .in("user_id", userIds);

    if (!directoryError && Array.isArray(directoryRows)) {
      directoryByUserId = new Map(directoryRows.map((row) => [row.user_id, row]));
    }
  }

  const hasTruthyFlag = (value) => {
    if (value === true) return true;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized === "true" || normalized === "yes" || normalized === "approved" || normalized === "verified";
    }
    return false;
  };

  const hasApprovalSignal = (user, directory) => {
    return (
      hasTruthyFlag(user?.is_verified) ||
      hasTruthyFlag(user?.verified) ||
      hasTruthyFlag(user?.is_approved) ||
      hasTruthyFlag(user?.approved) ||
      hasTruthyFlag(directory?.is_verified) ||
      hasTruthyFlag(directory?.verified) ||
      hasTruthyFlag(directory?.is_approved) ||
      hasTruthyFlag(directory?.approved) ||
      String(user?.verification_status || "").toLowerCase() === "verified" ||
      String(user?.verification_status || "").toLowerCase() === "approved" ||
      String(directory?.verification_status || "").toLowerCase() === "verified" ||
      String(directory?.verification_status || "").toLowerCase() === "approved" ||
      !!user?.approved_at ||
      !!directory?.approved_at
    );
  };

  const hasValidLicense = (user) => {
    const license = String(user?.license_number || "").trim();
    return license.length >= 4;
  };

  return users
    .map((user) => {
    const directory = directoryByUserId.get(user.id);
    const rawSpecialization = directory?.specialization ?? user.specialization;
    const specialization = Array.isArray(rawSpecialization)
      ? rawSpecialization
      : typeof rawSpecialization === "string" && rawSpecialization.trim().length > 0
        ? rawSpecialization.split(",").map((item) => item.trim()).filter(Boolean)
        : [];

    return {
      id: user.id,
      name: directory?.display_name || user.name || user.email?.split("@")[0] || "Lawyer",
      email: user.email || null,
      specialization,
      experience: Number(directory?.years_experience ?? user.years_experience ?? 0),
      rating: Number(directory?.rating ?? 0),
      reviews: Number(directory?.reviews_count ?? 0),
      location: directory?.location || user.law_firm || "Rwanda",
      hourlyRate: Number(directory?.hourly_rate ?? 50000),
      available: directory?.is_available !== false,
      verified: hasApprovalSignal(user, directory),
      hasLicense: hasValidLicense(user),
    };
  })
    .filter((lawyer) => lawyer.hasLicense && lawyer.verified);
}

export async function fetchCasesByRoleFromDb(supabaseAdmin, role) {
  if (!supabaseAdmin) return null;

  let query = supabaseAdmin.from("cases").select("*").order("filed_at", { ascending: false }).limit(100);
  if (role === "citizen") query = query.not("citizen_id", "is", null);
  if (role === "lawyer") query = query.not("assigned_lawyer_id", "is", null);
  if (role === "judge") query = query.not("assigned_judge_id", "is", null);
  if (role === "clerk") query = query.not("assigned_clerk_id", "is", null);

  const { data, error } = await query;
  if (error) return null;
  return (data || []).map(normalizeCaseRow);
}

export async function fetchAppointmentsByRoleFromDb(supabaseAdmin, role) {
  if (!supabaseAdmin) return null;

  let query = supabaseAdmin.from("appointments").select("*").order("starts_at", { ascending: true }).limit(100);
  if (role === "citizen") query = query.not("citizen_id", "is", null);
  if (role === "lawyer") query = query.not("lawyer_id", "is", null);
  if (role === "judge") query = query.not("judge_id", "is", null);
  if (role === "clerk") query = query.not("clerk_id", "is", null);

  const { data, error } = await query;
  if (error) return null;
  return (data || []).map(normalizeAppointmentRow);
}

export async function fetchMessagesByRoleFromDb(supabaseAdmin, role) {
  if (!supabaseAdmin) return null;

  // Lightweight conversation preview from latest messages.
  const { data: messages, error } = await supabaseAdmin
    .from("messages")
    .select("id, body, created_at, conversation_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return null;
  if (!messages || messages.length === 0) return [];

  return messages.slice(0, 20).map((m) => ({
    id: m.id,
    contact: `${role.toUpperCase()} Contact`,
    role: role,
    lastMessage: m.body,
    time: m.created_at,
    unread: 0,
    online: false,
  }));
}

export async function fetchDashboardBundleFromDb(supabaseAdmin, role) {
  const [cases, appointments, messages] = await Promise.all([
    fetchCasesByRoleFromDb(supabaseAdmin, role),
    fetchAppointmentsByRoleFromDb(supabaseAdmin, role),
    fetchMessagesByRoleFromDb(supabaseAdmin, role),
  ]);

  if (!cases || !appointments || !messages) return null;

  return {
    stats: {
      totalCases: cases.length,
      highPriority: cases.filter((c) => c.priority === "high" || c.priority === "urgent").length,
      pending: cases.filter((c) => /pending|awaiting|review/i.test(c.status)).length,
      resolved: cases.filter((c) => /closed|completed|resolved/i.test(c.status)).length,
    },
    cases,
    appointments,
    messages,
  };
}

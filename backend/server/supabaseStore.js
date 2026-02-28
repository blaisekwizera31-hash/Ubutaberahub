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
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("lawyers")
    .select("*")
    .order("rating", { ascending: false })
    .limit(50);

  if (error) return null;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.display_name,
    specialization: row.specialization || [],
    experience: row.years_experience || 0,
    rating: Number(row.rating || 4.5),
    reviews: row.reviews_count || 0,
    location: row.location || "Kigali, Rwanda",
    hourlyRate: row.hourly_rate || 50000,
    available: row.is_available !== false,
  }));
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


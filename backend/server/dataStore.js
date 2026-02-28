const nowIso = () => new Date().toISOString();

const store = {
  cases: [
    {
      id: "CASE-2024-001",
      title: "Property Dispute Resolution",
      type: "Property Law",
      status: "In Progress",
      priority: "high",
      date: "2024-01-10",
      userRole: "citizen",
      ownerId: "demo-citizen",
      lawyer: "Me. Jean Habimana",
    },
    {
      id: "CASE-2024-045",
      title: "Commercial Dispute - ABC Corp vs XYZ Ltd",
      type: "Civil",
      status: "Awaiting Ruling",
      priority: "high",
      date: "2024-01-08",
      userRole: "judge",
      ownerId: "demo-judge",
      lawyer: "High Court, Kigali",
    },
    {
      id: "CASE-2024-039",
      title: "Property Transfer - Uwimana Estate",
      type: "Civil",
      status: "Pending",
      priority: "medium",
      date: "2024-01-05",
      userRole: "lawyer",
      ownerId: "demo-lawyer",
      lawyer: "Primary Court, Gasabo",
    },
  ],
  appointments: [
    {
      id: "APT-001",
      userRole: "citizen",
      userId: "demo-citizen",
      lawyer: "Me. Jean Habimana",
      type: "Video Consultation",
      date: "2026-03-02",
      time: "10:00",
      duration: "30 min",
      status: "confirmed",
      caseId: "CASE-2024-001",
      isVideo: true,
    },
  ],
  messages: [
    {
      id: "MSG-001",
      userRole: "citizen",
      userId: "demo-citizen",
      contact: "Me. Jean Habimana",
      role: "Lawyer",
      lastMessage: "I've reviewed your case documents.",
      time: nowIso(),
      unread: 2,
      online: true,
    },
  ],
  lawyers: [
    {
      id: "L-001",
      name: "Me. Jean Habimana",
      specialization: ["Family Law", "Property Law"],
      experience: 12,
      rating: 4.9,
      reviews: 127,
      location: "Kigali, Rwanda",
      hourlyRate: 50000,
      available: true,
    },
    {
      id: "L-002",
      name: "Me. Marie Uwimana",
      specialization: ["Criminal Law", "Human Rights"],
      experience: 8,
      rating: 4.8,
      reviews: 89,
      location: "Kigali, Rwanda",
      hourlyRate: 45000,
      available: true,
    },
  ],
};

export function getDashboardBundle(role) {
  const roleCases = store.cases.filter((c) => c.userRole === role);
  return {
    stats: {
      totalCases: roleCases.length,
      highPriority: roleCases.filter((c) => c.priority === "high").length,
      pending: roleCases.filter((c) => /pending|awaiting|review/i.test(c.status)).length,
      resolved: roleCases.filter((c) => /closed|completed|resolved/i.test(c.status)).length,
    },
    cases: roleCases,
    appointments: store.appointments.filter((a) => a.userRole === role),
    messages: store.messages.filter((m) => m.userRole === role),
  };
}

export function getLawyers() {
  return store.lawyers;
}

export function getCasesByRole(role) {
  return store.cases.filter((c) => c.userRole === role);
}

export function getAppointmentsByRole(role) {
  return store.appointments.filter((a) => a.userRole === role);
}

export function getMessagesByRole(role) {
  return store.messages.filter((m) => m.userRole === role);
}


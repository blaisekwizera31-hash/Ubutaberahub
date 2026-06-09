import api from "@/lib/api";

type Role = "citizen" | "lawyer" | "judge" | "clerk";

export function getAccessToken(): string | null {
  return localStorage.getItem('authToken');
}

export async function loadSessionUser() {
  const response = await api.get<{ user: any }>("/auth/session-user");
  return response.data;
}

export async function syncOAuthUser(role: Role, name?: string) {
  const response = await api.post<{ user: any }>("/auth/sync-profile", { role, name });
  return response.data;
}

export async function getDashboardData(role: Role) {
  const response = await api.get<{
    stats: { totalCases: number; highPriority: number; pending: number; resolved: number };
    cases: any[];
    appointments: any[];
    messages: any[];
  }>(`/cases/dashboard/${role}`);
  return response.data;
}

export async function getLawyers() {
  const response = await api.get<{ lawyers: any[] }>("/lawyers");
  return response.data;
}

export async function getMessageUsers(role?: "citizen" | "lawyer" | "all") {
  const query = `?role=${encodeURIComponent(role || "all")}`;
  try {
    const response = await api.get<{ users: any[] }>(`/users/message-users${query}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error;
    const response = await api.get<{ users: any[] }>(`/auth/message-users${query}`);
    return response.data;
  }
}

export async function updateMyLawyerProfile(payload: {
  phone?: string;
  profilePhoto?: string;
  lawFirm?: string;
  specialization?: string;
  yearsExperience?: number | string;
  hourlyRate?: number | string;
  isAvailable?: boolean;
  availableTime?: string;
}) {
  const response = await api.patch<{ user: any }>("/lawyers/me", payload);
  return response.data;
}

export async function getMessages(role: Role) {
  const response = await api.get<{ conversations: any[] }>(`/conversations/role/${role}`);
  return response.data;
}

export async function getAppointments(role: Role) {
  const response = await api.get<{ appointments: any[] }>(`/appointments/${role}`);
  return response.data;
}

export async function getMyCases() {
  const response = await api.get<{ cases: any[] }>("/cases/me");
  return response.data;
}

export async function submitCaseToLawyer(payload: {
  title: string;
  description: string;
  caseType: string;
  priority: string;
  lawyerId: string;
  initialMessage?: string;
  documents?: File[];
}) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("caseType", payload.caseType);
  formData.append("priority", payload.priority);
  formData.append("lawyerId", payload.lawyerId);
  if (payload.initialMessage) formData.append("initialMessage", payload.initialMessage);
  payload.documents?.forEach((file) => formData.append("documents", file));

  const response = await api.post<{ ok: boolean; case: any; lawyer?: any }>("/cases/submit-to-lawyer", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getConversations() {
  const response = await api.get<{ conversations: any[] }>("/conversations");
  return response.data;
}

export async function getConversationMessages(conversationId: string) {
  const response = await api.get<{ messages: any[] }>(`/conversations/${conversationId}/messages`);
  return response.data;
}

export async function sendConversationMessage(conversationId: string, body: string) {
  const response = await api.post<{ message: any }>(`/conversations/${conversationId}/messages`, { body });
  return response.data;
}

export async function getNotifications() {
  const response = await api.get<{ notifications: any[]; unreadCount: number }>("/notifications");
  return response.data;
}

export async function markNotificationRead(notificationId: string) {
  const response = await api.post<{ ok: boolean }>("/notifications/read", { notificationId });
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.post<{ ok: boolean }>("/notifications/read", { markAll: true });
  return response.data;
}

export async function createConversation(payload: {
  lawyerId?: string;
  peerId?: string;
  subject?: string;
  caseId?: string;
  initialMessage?: string;
}) {
  const response = await api.post<{ conversation: any }>("/conversations", payload);
  return response.data;
}

export async function bookAppointment(payload: {
  lawyerId: string;
  appointmentType?: string;
  startsAt: string;
  durationMinutes?: number;
  mode?: "video" | "phone" | "in_person";
  caseId?: string;
  notes?: string;
}) {
  const response = await api.post<{ appointment: any }>("/appointments", payload);
  return response.data;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show",
) {
  const response = await api.patch<{ ok: boolean; appointment: any; conversation?: any }>(`/appointments/${appointmentId}/status`, { status });
  return response.data;
}

export async function updateCaseStatus(caseId: string, status: string) {
  const response = await api.post<{ ok: boolean; case: any }>(`/cases/${caseId}/status`, { status });
  return response.data;
}

export async function approveCase(caseId: string) {
  const response = await api.post<{ ok: boolean; case: any }>(`/cases/${caseId}/approve`);
  return response.data;
}

export async function getCaseDetails(caseId: string) {
  const response = await api.get<{ case: any; citizen: any; lawyer: any; evidence: any[] }>(`/cases/${caseId}/details`);
  return response.data;
}

export async function getMyAppointments() {
  const response = await api.get<{ appointments: any[] }>("/appointments/me");
  return response.data;
}

export async function summarizeTextWithAI(text: string, maxLength = 900) {
  const response = await api.post<{ summary: string }>("/summarize", { text, maxLength });
  return response.data;
}

export async function chatWithLegalAI(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>, language = "en") {
  const response = await api.post<{ response: string }>("/chat", { messages, language });
  return response.data;
}

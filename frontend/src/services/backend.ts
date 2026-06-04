import { supabase } from "@/lib/supabase";
import { apiGet, apiPost } from "@/lib/api";

type Role = "citizen" | "lawyer" | "judge" | "clerk";

export async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function loadSessionUser() {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiGet<{ user: any }>("/api/auth/session-user", token);
}

export async function syncOAuthUser(role: Role, name?: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiPost<{ user: any }>("/api/auth/sync-profile", { role, name }, token);
}

export async function getDashboardData(role: Role) {
  const token = await getAccessToken();
  return apiGet<{
    stats: { totalCases: number; highPriority: number; pending: number; resolved: number };
    cases: any[];
    appointments: any[];
    messages: any[];
  }>(`/api/cases/dashboard/${role}`, token || undefined);
}

export async function getLawyers() {
  return apiGet<{ lawyers: any[] }>("/api/lawyers");
}

export async function getMessages(role: Role) {
  const token = await getAccessToken();
  return apiGet<{ conversations: any[] }>(`/api/conversations/role/${role}`, token || undefined);
}

export async function getAppointments(role: Role) {
  const token = await getAccessToken();
  return apiGet<{ appointments: any[] }>(`/api/appointments/${role}`, token || undefined);
}

export async function getMyCases() {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiGet<{ cases: any[] }>("/api/cases/me", token);
}

export async function submitCaseToLawyer(payload: {
  title: string;
  description: string;
  caseType: string;
  priority: string;
  lawyerId: string;
  initialMessage?: string;
}) {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiPost<{ ok: boolean; case: any; conversation: any }>("/api/cases/submit-to-lawyer", payload, token);
}

export async function getConversations() {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiGet<{ conversations: any[] }>("/api/conversations", token);
}

export async function getConversationMessages(conversationId: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiGet<{ messages: any[] }>(`/api/conversations/${conversationId}/messages`, token);
}

export async function sendConversationMessage(conversationId: string, body: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiPost<{ message: any }>(`/api/conversations/${conversationId}/messages`, { body }, token);
}

export async function getNotifications() {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiGet<{ notifications: any[]; unreadCount: number }>("/api/notifications", token);
}

export async function markNotificationRead(notificationId: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiPost<{ ok: boolean }>("/api/notifications/read", { notificationId }, token);
}

export async function markAllNotificationsRead() {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiPost<{ ok: boolean }>("/api/notifications/read", { markAll: true }, token);
}

export async function createConversation(payload: {
  lawyerId: string;
  subject?: string;
  caseId?: string;
  initialMessage?: string;
}) {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiPost<{ conversation: any }>("/api/conversations", payload, token);
}

export async function bookAppointment(payload: {
  lawyerId: string;
  appointmentType?: string;
  startsAt: string;
  durationMinutes?: number;
  mode?: "video" | "in-person";
  caseId?: string;
  notes?: string;
}) {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiPost<{ appointment: any }>("/api/appointments", payload, token);
}

export async function updateCaseStatus(caseId: string, status: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiPost<{ ok: boolean; case: any }>(`/api/cases/${caseId}/status`, { status }, token);
}

export async function getMyAppointments() {
  const token = await getAccessToken();
  if (!token) throw new Error("No active session");
  return apiGet<{ appointments: any[] }>("/api/appointments/me", token);
}

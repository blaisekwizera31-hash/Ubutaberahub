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
  return apiGet<{
    stats: { totalCases: number; highPriority: number; pending: number; resolved: number };
    cases: any[];
    appointments: any[];
    messages: any[];
  }>(`/api/dashboard/${role}`);
}

export async function getLawyers() {
  return apiGet<{ lawyers: any[] }>("/api/lawyers");
}

export async function getMessages(role: Role) {
  return apiGet<{ conversations: any[] }>(`/api/messages/${role}`);
}

export async function getAppointments(role: Role) {
  return apiGet<{ appointments: any[] }>(`/api/appointments/${role}`);
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

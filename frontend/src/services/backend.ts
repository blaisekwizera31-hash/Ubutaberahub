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


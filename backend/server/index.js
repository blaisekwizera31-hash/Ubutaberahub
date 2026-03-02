import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import {
  getAppointmentsByRole,
  getCasesByRole,
  getDashboardBundle,
  getMessagesByRole,
} from "./dataStore.js";
import {
  fetchAppointmentsByRoleFromDb,
  fetchCasesByRoleFromDb,
  fetchDashboardBundleFromDb,
  fetchLawyersFromDb,
  fetchMessagesByRoleFromDb,
} from "./supabaseStore.js";

dotenv.config({ path: ".env" });

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8080")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here"
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  supabaseUrl && (supabaseService || supabaseAnon)
    ? createClient(supabaseUrl, supabaseService || supabaseAnon, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

function mapLang(language = "en") {
  if (language === "rw") return "Kinyarwanda";
  if (language === "fr") return "French";
  return "English";
}

function safeRole(value) {
  return ["citizen", "lawyer", "judge", "clerk"].includes(value) ? value : "citizen";
}

function safePriority(value) {
  return ["low", "medium", "high", "urgent"].includes(value) ? value : "medium";
}

function createCaseNumber() {
  const stamp = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CASE-${stamp}-${rand}`;
}

async function getProfileById(userId) {
  if (!supabaseAdmin || !userId) return null;
  const { data } = await supabaseAdmin.from("users").select("*").eq("id", userId).maybeSingle();
  return data || null;
}

async function isConversationParticipant(conversationId, userId) {
  if (!supabaseAdmin || !conversationId || !userId) return false;
  const { data, error } = await supabaseAdmin
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  return !error && !!data;
}

async function askGemini(prompt) {
  if (!genAI) {
    const err = new Error("Gemini not available");
    err.statusCode = 503;
    err.useLocalFallback = true;
    throw err;
  }
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const shouldRetry = (error) => {
    const status = Number(error?.status || error?.statusCode || 0);
    if ([429, 500, 502, 503, 504].includes(status)) return true;

    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("rate") ||
      message.includes("quota") ||
      message.includes("timeout") ||
      message.includes("unavailable") ||
      message.includes("overloaded")
    );
  };

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (!shouldRetry(error)) {
      throw error;
    }

    // One short retry for transient upstream failures.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

async function getUserFromBearer(req) {
  if (!supabaseAdmin) return null;
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    geminiAvailable: !!genAI,
    supabaseConfigured: !!supabaseAdmin,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/auth/session-user", async (req, res) => {
  try {
    const authUser = await getUserFromBearer(req);
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!supabaseAdmin) {
      return res.json({
        user: {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
          role: "citizen",
        },
      });
    }

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profile) return res.json({ user: profile });

    const fallbackUser = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
      profile_photo: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
      role: "citizen",
    };

    const { data: inserted } = await supabaseAdmin
      .from("users")
      .insert([fallbackUser])
      .select("*")
      .maybeSingle();

    return res.json({ user: inserted || fallbackUser });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load session user", message: error.message });
  }
});

app.post("/api/auth/sync-profile", async (req, res) => {
  try {
    const authUser = await getUserFromBearer(req);
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured on backend" });

    const role = safeRole(req.body?.role || "citizen");
    const name =
      req.body?.name ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      "User";
    const profile_photo =
      req.body?.profile_photo ||
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      null;

    const payload = {
      id: authUser.id,
      email: authUser.email,
      name,
      role,
      profile_photo,
    };

    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert([payload], { onConflict: "id" })
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: "Failed to sync user profile", message: error.message });
    return res.json({ user: data });
  } catch (error) {
    return res.status(500).json({ error: "Failed to sync profile", message: error.message });
  }
});

app.get("/api/dashboard/:role", async (req, res) => {
  const role = safeRole(req.params.role);
  const fromDb = await fetchDashboardBundleFromDb(supabaseAdmin, role);
  return res.json(fromDb || getDashboardBundle(role));
});

app.get("/api/cases/:role", async (req, res) => {
  const role = safeRole(req.params.role);
  const fromDb = await fetchCasesByRoleFromDb(supabaseAdmin, role);
  return res.json({ cases: fromDb || getCasesByRole(role) });
});

app.get("/api/cases/me", async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured on backend" });
    const authUser = await getUserFromBearer(req);
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const orFilter = [
      `citizen_id.eq.${authUser.id}`,
      `assigned_lawyer_id.eq.${authUser.id}`,
      `assigned_judge_id.eq.${authUser.id}`,
      `assigned_clerk_id.eq.${authUser.id}`,
    ].join(",");

    const { data: rows, error } = await supabaseAdmin
      .from("cases")
      .select("*")
      .or(orFilter)
      .order("filed_at", { ascending: false })
      .limit(200);
    if (error) return res.status(500).json({ error: "Failed to load my cases", message: error.message });

    const lawyerIds = [...new Set((rows || []).map((r) => r.assigned_lawyer_id).filter(Boolean))];
    const citizenIds = [...new Set((rows || []).map((r) => r.citizen_id).filter(Boolean))];
    const profileIds = [...new Set([...lawyerIds, ...citizenIds])];
    const { data: profiles } = profileIds.length
      ? await supabaseAdmin.from("users").select("id, name, email").in("id", profileIds)
      : { data: [] };
    const profileById = new Map((profiles || []).map((u) => [u.id, u]));

    const cases = (rows || []).map((row) => {
      const assignedLawyer = profileById.get(row.assigned_lawyer_id);
      const citizen = profileById.get(row.citizen_id);
      return {
        id: row.case_number || row.id,
        title: row.title,
        type: row.case_type || "Other",
        status: row.status || "Pending",
        priority: row.priority || "medium",
        date: row.filed_at ? new Date(row.filed_at).toISOString().slice(0, 10) : "",
        lawyer:
          assignedLawyer?.name ||
          assignedLawyer?.email?.split("@")[0] ||
          row.metadata?.lawyer ||
          "",
        citizen: citizen?.name || citizen?.email?.split("@")[0] || "",
        requestedBy: citizen?.name || citizen?.email?.split("@")[0] || "",
      };
    });

    return res.json({ cases });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load my cases", message: error.message });
  }
});

app.get("/api/appointments/:role", async (req, res) => {
  const role = safeRole(req.params.role);
  const fromDb = await fetchAppointmentsByRoleFromDb(supabaseAdmin, role);
  return res.json({ appointments: fromDb || getAppointmentsByRole(role) });
});

app.get("/api/messages/:role", async (req, res) => {
  const role = safeRole(req.params.role);
  const fromDb = await fetchMessagesByRoleFromDb(supabaseAdmin, role);
  return res.json({ conversations: fromDb || getMessagesByRole(role) });
});

app.get("/api/lawyers", async (req, res) => {
  const fromDb = await fetchLawyersFromDb(supabaseAdmin);
  return res.json({ lawyers: fromDb || [] });
});

app.post("/api/cases/submit-to-lawyer", async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured on backend" });
    const authUser = await getUserFromBearer(req);
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const citizenProfile = await getProfileById(authUser.id);
    if (!citizenProfile) return res.status(400).json({ error: "Citizen profile not found" });
    if (citizenProfile.role !== "citizen") return res.status(403).json({ error: "Only citizens can submit cases to lawyers" });

    const { title, description, caseType, priority, lawyerId, initialMessage } = req.body || {};
    if (!title || !description || !caseType || !lawyerId) {
      return res.status(400).json({ error: "title, description, caseType and lawyerId are required" });
    }

    const lawyerProfile = await getProfileById(lawyerId);
    if (!lawyerProfile || lawyerProfile.role !== "lawyer") {
      return res.status(400).json({ error: "Selected lawyer is invalid" });
    }

    const caseNumber = createCaseNumber();
    const casePayload = {
      case_number: caseNumber,
      title: String(title).trim(),
      description: String(description).trim(),
      case_type: String(caseType).trim(),
      status: "Pending",
      priority: safePriority(priority),
      citizen_id: authUser.id,
      assigned_lawyer_id: lawyerId,
      metadata: {
        submitted_to_lawyer: true,
        submitted_at: new Date().toISOString(),
      },
    };

    const { data: insertedCase, error: caseError } = await supabaseAdmin
      .from("cases")
      .insert([casePayload])
      .select("*")
      .single();
    if (caseError) {
      return res.status(500).json({ error: "Failed to create case", message: caseError.message });
    }

    const { data: conversation, error: convError } = await supabaseAdmin
      .from("conversations")
      .insert([
        {
          subject: `Case ${insertedCase.case_number}: ${insertedCase.title}`,
          case_id: insertedCase.id,
          created_by: authUser.id,
        },
      ])
      .select("*")
      .single();
    if (convError) {
      return res.status(500).json({ error: "Case created but failed to create conversation", message: convError.message });
    }

    const { error: participantsError } = await supabaseAdmin.from("conversation_participants").insert([
      { conversation_id: conversation.id, user_id: authUser.id, role: "citizen", unread_count: 0 },
      { conversation_id: conversation.id, user_id: lawyerId, role: "lawyer", unread_count: 1 },
    ]);
    if (participantsError) {
      return res.status(500).json({ error: "Case created but failed to add participants", message: participantsError.message });
    }

    const firstMessage = String(initialMessage || description).trim();
    if (firstMessage) {
      await supabaseAdmin.from("messages").insert([
        {
          conversation_id: conversation.id,
          sender_id: authUser.id,
          body: firstMessage,
        },
      ]);
    }

    return res.status(201).json({
      ok: true,
      case: insertedCase,
      conversation: {
        id: conversation.id,
        subject: conversation.subject,
        lawyer: {
          id: lawyerProfile.id,
          name: lawyerProfile.name || lawyerProfile.email?.split("@")[0] || "Lawyer",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit case to lawyer", message: error.message });
  }
});

app.get("/api/conversations", async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured on backend" });
    const authUser = await getUserFromBearer(req);
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const { data: participantRows, error: participantError } = await supabaseAdmin
      .from("conversation_participants")
      .select("conversation_id, unread_count")
      .eq("user_id", authUser.id);
    if (participantError) {
      return res.status(500).json({ error: "Failed to load conversations", message: participantError.message });
    }

    const conversationIds = (participantRows || []).map((row) => row.conversation_id);
    if (conversationIds.length === 0) return res.json({ conversations: [] });

    const { data: conversations, error: conversationsError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .in("id", conversationIds);
    if (conversationsError) {
      return res.status(500).json({ error: "Failed to load conversations", message: conversationsError.message });
    }

    const { data: participants, error: peersError } = await supabaseAdmin
      .from("conversation_participants")
      .select("conversation_id, user_id, role")
      .in("conversation_id", conversationIds)
      .neq("user_id", authUser.id);
    if (peersError) {
      return res.status(500).json({ error: "Failed to load conversation participants", message: peersError.message });
    }

    const peerIds = [...new Set((participants || []).map((row) => row.user_id).filter(Boolean))];
    const { data: peerProfiles } = peerIds.length
      ? await supabaseAdmin.from("users").select("id, name, email, role").in("id", peerIds)
      : { data: [] };
    const peerById = new Map((peerProfiles || []).map((p) => [p.id, p]));

    const { data: recentMessages, error: messageError } = await supabaseAdmin
      .from("messages")
      .select("id, conversation_id, body, created_at, sender_id")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false })
      .limit(500);
    if (messageError) {
      return res.status(500).json({ error: "Failed to load conversation messages", message: messageError.message });
    }

    const latestByConversation = new Map();
    for (const msg of recentMessages || []) {
      if (!latestByConversation.has(msg.conversation_id)) latestByConversation.set(msg.conversation_id, msg);
    }

    const unreadByConversation = new Map((participantRows || []).map((r) => [r.conversation_id, r.unread_count || 0]));
    const peerByConversation = new Map();
    for (const row of participants || []) {
      if (!peerByConversation.has(row.conversation_id)) peerByConversation.set(row.conversation_id, row);
    }

    const payload = (conversations || [])
      .map((conv) => {
        const peer = peerByConversation.get(conv.id);
        const peerProfile = peer ? peerById.get(peer.user_id) : null;
        const latest = latestByConversation.get(conv.id);
        return {
          id: conv.id,
          subject: conv.subject,
          caseId: conv.case_id || null,
          updatedAt: latest?.created_at || conv.updated_at || conv.created_at,
          unread: unreadByConversation.get(conv.id) || 0,
          contact: peerProfile?.name || peerProfile?.email?.split("@")[0] || "Contact",
          contactId: peerProfile?.id || null,
          role: peerProfile?.role || peer?.role || "user",
          lastMessage: latest?.body || "",
          lastMessageAt: latest?.created_at || conv.updated_at || conv.created_at,
          online: false,
        };
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return res.json({ conversations: payload });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load conversations", message: error.message });
  }
});

app.get("/api/conversations/:conversationId/messages", async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured on backend" });
    const authUser = await getUserFromBearer(req);
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const conversationId = req.params.conversationId;
    const allowed = await isConversationParticipant(conversationId, authUser.id);
    if (!allowed) return res.status(403).json({ error: "Forbidden" });

    const { data: rows, error } = await supabaseAdmin
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) return res.status(500).json({ error: "Failed to load messages", message: error.message });

    const senderIds = [...new Set((rows || []).map((m) => m.sender_id).filter(Boolean))];
    const { data: senders } = senderIds.length
      ? await supabaseAdmin.from("users").select("id, name, email").in("id", senderIds)
      : { data: [] };
    const senderById = new Map((senders || []).map((u) => [u.id, u]));

    await supabaseAdmin
      .from("conversation_participants")
      .update({ unread_count: 0 })
      .eq("conversation_id", conversationId)
      .eq("user_id", authUser.id);

    const messages = (rows || []).map((m) => {
      const sender = senderById.get(m.sender_id);
      return {
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderName: sender?.name || sender?.email?.split("@")[0] || "User",
        body: m.body,
        createdAt: m.created_at,
        isOwn: m.sender_id === authUser.id,
      };
    });

    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load messages", message: error.message });
  }
});

app.post("/api/conversations/:conversationId/messages", async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured on backend" });
    const authUser = await getUserFromBearer(req);
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const conversationId = req.params.conversationId;
    const allowed = await isConversationParticipant(conversationId, authUser.id);
    if (!allowed) return res.status(403).json({ error: "Forbidden" });

    const body = String(req.body?.body || req.body?.message || "").trim();
    if (!body) return res.status(400).json({ error: "Message body is required" });

    const { data: inserted, error } = await supabaseAdmin
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          sender_id: authUser.id,
          body,
        },
      ])
      .select("id, conversation_id, sender_id, body, created_at")
      .single();
    if (error) return res.status(500).json({ error: "Failed to send message", message: error.message });

    const { data: others } = await supabaseAdmin
      .from("conversation_participants")
      .select("id, user_id, unread_count")
      .eq("conversation_id", conversationId)
      .neq("user_id", authUser.id);

    for (const participant of others || []) {
      await supabaseAdmin
        .from("conversation_participants")
        .update({ unread_count: Number(participant.unread_count || 0) + 1 })
        .eq("id", participant.id);
    }

    await supabaseAdmin
      .from("conversation_participants")
      .update({ unread_count: 0 })
      .eq("conversation_id", conversationId)
      .eq("user_id", authUser.id);

    return res.status(201).json({
      message: {
        id: inserted.id,
        conversationId: inserted.conversation_id,
        senderId: inserted.sender_id,
        body: inserted.body,
        createdAt: inserted.created_at,
        isOwn: true,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send message", message: error.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, language = "en" } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const lastMessage = messages.filter((m) => m.role === "user").pop();
    if (!lastMessage) return res.json({ response: "How can I help you with legal questions today?" });

    const prompt = `You are a legal assistant for Rwanda. Respond in ${mapLang(language)}.
Provide general legal information only and recommend speaking to a licensed lawyer.
User question: ${lastMessage.content}`;

    const text = await askGemini(prompt);
    return res.json({ response: text });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: "Failed to generate response",
      message: error.message,
      useLocalFallback: !!error.useLocalFallback,
    });
  }
});

app.post("/api/classify-case", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Title and description required" });

    const prompt = `Classify this Rwandan legal case and return valid JSON only.
Case Title: ${title}
Description: ${description}
Categories: Criminal Defense, Family Law, Property Dispute, Employment Law, Contract Dispute, Business Law, Other
Priority: low, medium, high
JSON keys: category, priority, confidence, reasoning`;

    const text = await askGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model returned non-JSON output");
    return res.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: "Failed to classify case",
      message: error.message,
      useLocalFallback: !!error.useLocalFallback,
    });
  }
});

app.post("/api/analyze-document", async (req, res) => {
  try {
    const { documentText, fileName } = req.body;
    if (!documentText || !fileName) return res.status(400).json({ error: "Document text and filename required" });

    const prompt = `Analyze this legal document for Rwanda and return JSON only.
Document: ${fileName}
Content: ${String(documentText).slice(0, 3000)}
JSON keys: summary, keyPoints, parties, dates, suggestedCategory, suggestedPriority, legalIssues`;

    const text = await askGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model returned non-JSON output");
    return res.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: "Failed to analyze document",
      message: error.message,
      useLocalFallback: !!error.useLocalFallback,
    });
  }
});

app.post("/api/legal-guidance", async (req, res) => {
  try {
    const { caseType, language = "en" } = req.body;
    if (!caseType) return res.status(400).json({ error: "Case type required" });

    const prompt = `Provide practical legal guidance in ${mapLang(language)} for this Rwanda case type: ${caseType}.
Include overview, rights, procedures, required documents, when to seek legal counsel.`;
    const text = await askGemini(prompt);
    return res.json({ guidance: text });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: "Failed to generate guidance",
      message: error.message,
      useLocalFallback: !!error.useLocalFallback,
    });
  }
});

app.post("/api/summarize", async (req, res) => {
  try {
    const { text, maxLength = 200 } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    const prompt = `Summarize this in ${Math.max(80, Number(maxLength) || 200)} characters or fewer:\n\n${text}`;
    const summary = await askGemini(prompt);
    return res.json({ summary });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: "Failed to summarize text",
      message: error.message,
      useLocalFallback: !!error.useLocalFallback,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Gemini: ${genAI ? "active" : "disabled (frontend fallback will be used)"}`);
  console.log(`Supabase backend: ${supabaseAdmin ? "configured" : "not configured"}`);
});

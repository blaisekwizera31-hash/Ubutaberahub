import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import {
  getAppointmentsByRole,
  getCasesByRole,
  getDashboardBundle,
  getLawyers,
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
  return res.json({ lawyers: fromDb || getLawyers() });
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

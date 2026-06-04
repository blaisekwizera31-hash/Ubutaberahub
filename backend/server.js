/**
 * server.js — Entry point
 *
 * Structure:
 *   backend/
 *   ├── node_modules/
 *   ├── middleware/      auth, rateLimiter, validate, logger, errorHandler
 *   ├── controllers/     authController, caseController, messageController,
 *   │                    aiController, notificationController,
 *   │                    appointmentController, lawyerController
 *   ├── routes/          authRoutes, caseRoutes, messageRoutes, aiRoutes,
 *   │                    notificationRoutes, appointmentRoutes, lawyerRoutes
 *   ├── models/          supabase, gemini, dataStore, supabaseStore
 *   └── server.js
 */

import "dotenv/config";
import express from "express";
import cors    from "cors";

// ── Middleware ────────────────────────────────────────────────────────────────
import { requestLogger }         from "./middleware/logger.js";
import { generalLimiter }        from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// ── Routes ────────────────────────────────────────────────────────────────────
import authRoutes         from "./routes/authRoutes.js";
import caseRoutes         from "./routes/caseRoutes.js";
import messageRoutes      from "./routes/messageRoutes.js";
import aiRoutes           from "./routes/aiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import appointmentRoutes  from "./routes/appointmentRoutes.js";
import lawyerRoutes       from "./routes/lawyerRoutes.js";

// ── Models (for health check) ─────────────────────────────────────────────────
import { genAI }         from "./models/gemini.js";
import { supabaseAdmin } from "./models/supabase.js";

// ─────────────────────────────────────────────────────────────────────────────

const app  = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8080")
  .split(",").map((o) => o.trim()).filter(Boolean);

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(requestLogger);   // log every request
app.use(generalLimiter);  // 120 req/min global rate limit

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({
    status:            "ok",
    geminiAvailable:   !!genAI,
    supabaseConfigured: !!supabaseAdmin,
    timestamp:         new Date().toISOString(),
  })
);

// ── Route mounting ────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/cases",         caseRoutes);
app.use("/api/conversations", messageRoutes);
app.use("/api",               aiRoutes);           // /api/chat, /api/classify-case, etc.
app.use("/api/notifications", notificationRoutes);
app.use("/api/appointments",  appointmentRoutes);
app.use("/api/lawyers",       lawyerRoutes);
app.use("/api/messages",      messageRoutes);      // legacy /api/messages/:role

// ── 404 + error handlers (must be last) ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Backend running on http://localhost:${PORT}`);
  console.log(`🤖  Gemini:   ${genAI         ? "✅ active"      : "❌ disabled (local AI fallback)"}`);
  console.log(`🗄️   Supabase: ${supabaseAdmin ? "✅ configured"  : "❌ not configured"}\n`);
});

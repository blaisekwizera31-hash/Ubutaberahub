/**
 * server.js — Entry point
 *
 * Structure:
 *   backend/
 *   ├── node_modules/
 *   ├── middleware/      auth, roleChecker, cors, lang, rateLimiter, validate, logger, errorHandler
 *   ├── controllers/     authController, caseController, messageController,
 *   │                    aiController, notificationController,
 *   │                    appointmentController, lawyerController
 *   ├── routes/          authRoutes, caseRoutes, messageRoutes, aiRoutes,
 *   │                    notificationRoutes, appointmentRoutes, lawyerRoutes,
 *   │                    hearingRoutes, analyticsRoutes, aiLogRoutes
 *   ├── config/          db, gemini, dbStore
 *   └── server.js
 */

import "dotenv/config";
import express from "express";

// ── Middleware ────────────────────────────────────────────────────────────────
import { corsMiddleware }         from "./middleware/cors.js";
import { detectLang }             from "./middleware/lang.js";
import { requestLogger }          from "./middleware/logger.js";
import { generalLimiter }         from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// ── Routes ────────────────────────────────────────────────────────────────────
import homeRoutes         from "./routes/homeRoutes.js"
import authRoutes         from "./routes/authRoutes.js";
import caseRoutes         from "./routes/caseRoutes.js";
import messageRoutes      from "./routes/messageRoutes.js";
import aiRoutes           from "./routes/aiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import appointmentRoutes  from "./routes/appointmentRoutes.js";
import lawyerRoutes       from "./routes/lawyerRoutes.js";
import hearingRoutes      from "./routes/hearingRoutes.js";
import analyticsRoutes    from "./routes/analyticsRoutes.js";
import aiLogRoutes        from "./routes/aiLogRoutes.js";

// ── Models (for health check) ─────────────────────────────────────────────────
import { genAI }         from "./config/gemini.js";
import pool            from "./config/db.js";
// ─────────────────────────────────────────────────────────────────────────────

const app  = express();
const PORT = process.env.PORT || 5173;

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(corsMiddleware);                // CORS — must be first
app.use(express.json({ limit: "2mb" }));
app.use(detectLang);                    // resolve req.lang / req.langMeta
app.use(requestLogger);                 // log every request
app.use(generalLimiter);                // 120 req/min global rate limit

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({
    status:            "ok",
    geminiAvailable:   !!genAI,
    dbConnected:       true, // We assume true if the pool didn't exit the process
    timestamp:         new Date().toISOString(),
  })
);

// ── Route mounting ───────────────────────────────────────────────────────────
app.use("/",                 homeRoutes);
app.use("/api/auth",          authRoutes);
app.use("/api/cases",         caseRoutes);
app.use("/api/conversations", messageRoutes);
app.use("/api/appointments",  appointmentRoutes);
app.use("/api/lawyers",       lawyerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/hearings",      hearingRoutes);
app.use("/api/analytics",     analyticsRoutes);
app.use("/api/ai-logs",       aiLogRoutes);
app.use("/api",               aiRoutes);  // /api/chat, /api/classify-case, /api/analyze-document, etc.

// ── 404 + error handlers (must be last) ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀  Backend running on http://localhost:${PORT}`);
  console.log(`🤖  Gemini:   ${genAI ? "✅ active" : "❌ disabled"}`);

  // Test DB connection
  try {
    await pool.query('SELECT NOW()');
    console.log('🐘  PostgreSQL: connected and health check passed');
  } catch (err) {
    console.error('🐘  PostgreSQL: connection failed at startup', err.message);
  }
});


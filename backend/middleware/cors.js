/**
 * CORS Middleware
 * Manages secure cross-origin requests from the React PWA frontend
 * hosted on Vercel (and local dev environments).
 *
 * Allowed origins are driven by the CORS_ORIGIN environment variable —
 * a comma-separated list of permitted origins:
 *
 *   CORS_ORIGIN=https://ubutaberahub.vercel.app,https://ubutaberahub-git-main.vercel.app
 *
 * In development, http://localhost:* origins are also allowed automatically
 * when NODE_ENV !== 'production'.
 */

import corsLib from 'cors';

/** HTTP methods the frontend is permitted to use */
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

/** Headers the frontend may send */
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-App-Language',    // lang.js language negotiation
  'Accept-Language',   // standard language negotiation
  'X-Requested-With',
];

/** Headers the frontend is allowed to read from responses */
const EXPOSED_HEADERS = [
  'X-Resolved-Language',   // echoed back by lang.js
  'Retry-After',            // echoed back by rateLimiter.js
];

/**
 * Builds the set of allowed origins from the environment.
 * Falls back to localhost:8080 when CORS_ORIGIN is not set.
 *
 * @returns {Set<string>}
 */
function buildAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:8080';
  return new Set(
    raw.split(',').map((o) => o.trim()).filter(Boolean)
  );
}

/**
 * originValidator - Determines whether an incoming origin is permitted.
 *
 * Rules:
 *  1. No origin (same-origin requests, curl, mobile) → allowed.
 *  2. Explicitly listed in CORS_ORIGIN → allowed.
 *  3. localhost / 127.0.0.1 on any port in non-production → allowed.
 *  4. Everything else → blocked.
 *
 * @param {Set<string>} allowedOrigins
 * @param {string|undefined} origin
 * @param {Function} callback
 */
function originValidator(allowedOrigins, origin, callback) {
  // Same-origin or non-browser requests (no Origin header)
  if (!origin) return callback(null, true);

  // Explicitly whitelisted
  if (allowedOrigins.has(origin)) return callback(null, true);

  // Local dev: allow localhost / 127.0.0.1 on any port
  if (process.env.NODE_ENV !== 'production') {
    const isLocal =
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
    if (isLocal) return callback(null, true);
  }

  console.warn(`[cors] Blocked origin: ${origin}`);
  return callback(new Error('CORS blocked'));
}

/**
 * buildCorsOptions - Returns the cors() options object.
 * Called lazily so environment variables are resolved at request time
 * (important for test environments that set variables after import).
 */
function buildCorsOptions() {
  const allowedOrigins = buildAllowedOrigins();
  return {
    origin:           (origin, cb) => originValidator(allowedOrigins, origin, cb),
    methods:          ALLOWED_METHODS,
    allowedHeaders:   ALLOWED_HEADERS,
    exposedHeaders:   EXPOSED_HEADERS,
    credentials:      true,           // allow cookies / Authorization headers
    maxAge:           86400,          // preflight cache: 24 h
    optionsSuccessStatus: 204,        // some legacy browsers choke on 200 for OPTIONS
  };
}

/**
 * corsMiddleware - Ready-to-use Express middleware.
 * Apply this FIRST in server.js, before any other middleware.
 *
 * Usage in server.js:
 *   import { corsMiddleware } from './middleware/cors.js';
 *   app.use(corsMiddleware);
 */
export const corsMiddleware = corsLib(buildCorsOptions());

/**
 * handlePreflight - Explicit OPTIONS handler for routers that need it.
 * Usually not needed when corsMiddleware is applied globally, but provided
 * for completeness.
 */
export const handlePreflight = corsLib({ ...buildCorsOptions(), preflightContinue: false });

/**
 * models/supabase.js
 * Supabase client factory — single instance shared across the app
 *
 * Two clients are exported:
 *
 *  supabaseAdmin  — built with SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
 *                   Used by all server-side controllers for privileged reads/writes.
 *                   Falls back to anon key only in local dev when service key is absent.
 *
 *  supabasePublic — built with the anon key (respects RLS).
 *                   Use this if you ever need to make user-scoped queries
 *                   on behalf of the authenticated user.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.SUPABASE_URL     || process.env.VITE_SUPABASE_URL;
const supabaseAnon    = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl)     console.warn("[supabase] SUPABASE_URL is not set.");
if (!supabaseService) console.warn("[supabase] SUPABASE_SERVICE_ROLE_KEY is not set — admin client will use anon key (RLS not bypassed).");

const adminKey = supabaseService || supabaseAnon; // service key preferred; anon only as local dev fallback

/**
 * supabaseAdmin — privileged server-side client.
 * Must use the service role key in production.
 */
export const supabaseAdmin =
  supabaseUrl && adminKey
    ? createClient(supabaseUrl, adminKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

/**
 * supabasePublic — anon/public client (respects RLS).
 * Use when you want to make queries that enforce row-level security.
 */
export const supabasePublic =
  supabaseUrl && supabaseAnon
    ? createClient(supabaseUrl, supabaseAnon, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

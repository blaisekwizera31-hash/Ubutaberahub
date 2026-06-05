/**
 * config/supabase.js
 * Supabase client factory — single instance shared across the app
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.SUPABASE_URL     || process.env.VITE_SUPABASE_URL;
const supabaseAnon    = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Validate env vars at startup ──────────────────────────────────────────────
if (!supabaseUrl)     console.error("[supabase] ❌  SUPABASE_URL is not set.");
if (!supabaseAnon)    console.warn ("[supabase] ⚠️   SUPABASE_ANON_KEY is not set.");
if (!supabaseService) console.warn ("[supabase] ⚠️   SUPABASE_SERVICE_ROLE_KEY is not set — falling back to anon key (RLS will NOT be bypassed).");

const adminKey = supabaseService || supabaseAnon;

// ── supabaseAdmin — bypasses RLS, for all server-side operations ──────────────
export const supabaseAdmin =
  supabaseUrl && adminKey
    ? createClient(supabaseUrl, adminKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

// ── supabasePublic — respects RLS, for user-scoped queries if ever needed ─────
export const supabasePublic =
  supabaseUrl && supabaseAnon
    ? createClient(supabaseUrl, supabaseAnon, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

// ── testSupabaseConnection — called once at server startup ────────────────────
export async function testSupabaseConnection() {
  if (!supabaseAdmin) {
    console.error("❌  Supabase: client not initialized — check SUPABASE_URL and keys in .env");
    return false;
  }

  try {
    const { error } = await supabaseAdmin
      .from("users")
      .select("id")
      .limit(1);

    if (error) throw error;

    console.log("✅  Supabase: database connected successfully");
    return true;
  } catch (err) {
    const msg = err.message || "";

    if (msg.includes("Invalid API key") || msg.includes("apikey")) {
      console.error("❌  Supabase: invalid API key — check your keys in .env");
    } else if (msg.includes("relation") || msg.includes("does not exist")) {
      console.error("❌  Supabase: connected but 'users' table not found — check your schema");
    } else {
      console.error("❌  Supabase: connection failed —", msg);
    }
    return false;
  }
}
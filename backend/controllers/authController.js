/**
 * controllers/authController.js
 */

import { supabaseAdmin } from "../config/supabase.js";

const safeRole = (v) =>
  ["citizen", "lawyer", "judge", "clerk"].includes(v) ? v : "citizen";

export async function getSessionUser(req, res) {
  try {
    const authUser = req.user;

    if (!supabaseAdmin) {
      return res.json({
        user: {
          id:    authUser.id,
          email: authUser.email,
          name:  authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
          role:  "citizen",
        },
      });
    }

    const { data: profile } = await supabaseAdmin
      .from("users").select("*").eq("id", authUser.id).maybeSingle();

    if (profile) return res.json({ user: profile });

    const fallback = {
      id:            authUser.id,
      email:         authUser.email,
      name:          authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
      profile_photo: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
      role:          "citizen",
    };

    const { data: inserted } = await supabaseAdmin
      .from("users").insert([fallback]).select("*").maybeSingle();

    return res.json({ user: inserted || fallback });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load session user", message: err.message });
  }
}

export async function syncProfile(req, res) {
  try {
    const authUser = req.user;
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

    const role  = safeRole(req.body?.role || "citizen");
    const name  =
      req.body?.name ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] || "User";
    const profile_photo =
      req.body?.profile_photo ||
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture || null;

    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert([{ id: authUser.id, email: authUser.email, name, role, profile_photo }], { onConflict: "id" })
      .select("*").single();

    if (error) return res.status(500).json({ error: "Failed to sync profile", message: error.message });
    return res.json({ user: data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to sync profile", message: err.message });
  }
}

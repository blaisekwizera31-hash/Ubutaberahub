/**
 * controllers/lawyerController.js
 */

import { supabaseAdmin } from "../config/supabase.js";
import { fetchLawyersFromDb } from "../config/supabaseStore.js";

export async function getLawyers(req, res) {
  const lawyers = await fetchLawyersFromDb(supabaseAdmin);
  return res.json({ lawyers: lawyers || [] });
}

/**
 * controllers/lawyerController.js
 */

import { supabaseAdmin } from "../models/supabase.js";
import { fetchLawyersFromDb } from "../models/supabaseStore.js";

export async function getLawyers(req, res) {
  const lawyers = await fetchLawyersFromDb(supabaseAdmin);
  return res.json({ lawyers: lawyers || [] });
}

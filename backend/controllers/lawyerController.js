/**
 * controllers/lawyerController.js
 */

import { fetchLawyersFromDb } from "../config/dbStore.js";

export async function getLawyers(req, res) {
  const lawyers = await fetchLawyersFromDb();
  return res.json({ lawyers: lawyers || [] });
}

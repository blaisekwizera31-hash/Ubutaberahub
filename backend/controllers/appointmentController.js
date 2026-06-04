/**
 * controllers/appointmentController.js
 */

import { supabaseAdmin } from "../models/supabase.js";
import { getAppointmentsByRole } from "../models/dataStore.js";
import { fetchAppointmentsByRoleFromDb } from "../models/supabaseStore.js";

const safeRole = (v) => ["citizen","lawyer","judge","clerk"].includes(v) ? v : "citizen";

export async function getAppointments(req, res) {
  const role   = safeRole(req.params.role);
  const fromDb = await fetchAppointmentsByRoleFromDb(supabaseAdmin, role);
  return res.json({ appointments: fromDb || getAppointmentsByRole(role) });
}

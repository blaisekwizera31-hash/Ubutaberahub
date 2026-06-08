import * as UserModel from "../models/userModel.js";
import pool from "../config/db.js";

const CONTACT_ROLES = new Set(["citizen", "lawyer"]);

export async function getMessageUsers(req, res) {
  try {
    const requestedRole = String(req.query.role || "all").toLowerCase();
    if (requestedRole !== "all" && !CONTACT_ROLES.has(requestedRole)) {
      return res.status(400).json({ error: "role must be citizen or lawyer" });
    }

    if (requestedRole === "all") {
      const { rows } = await pool.query(
        `
          SELECT id, email, name, role, profile_photo, specialization
          FROM users
          WHERE id != $1
          ORDER BY role ASC, name ASC, email ASC
          LIMIT 500
        `,
        [req.user.id],
      );

      return res.json({
        users: rows.map((user) => ({
          id: user.id,
          name: user.name || user.email?.split("@")[0] || "User",
          email: user.email,
          role: user.role || "user",
          profilePhoto: user.profile_photo || null,
          subtitle: user.role === "lawyer" ? user.specialization || user.email || "" : `${user.role || "user"}${user.email ? ` - ${user.email}` : ""}`,
        })),
      });
    }

    const users = await UserModel.listByRole(requestedRole, { limit: 200 });
    return res.json({
      users: users
        .filter((user) => user.id !== req.user.id)
        .map((user) => ({
          id: user.id,
          name: user.name || user.email?.split("@")[0] || (requestedRole === "lawyer" ? "Lawyer" : "Citizen"),
          email: user.email,
          role: requestedRole,
          profilePhoto: user.profile_photo || null,
          subtitle: requestedRole === "lawyer" ? user.specialization || user.email || "" : user.email || "",
        })),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load message users", message: err.message });
  }
}

export const getMessageContacts = getMessageUsers;

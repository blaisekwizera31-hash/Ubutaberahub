import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

try {
  const db = await pool.query("SELECT current_database() AS db, NOW() AS now");
  const users = await pool.query("SELECT to_regclass($1) AS users_table", [
    "public.users",
  ]);

  console.log("Database:", db.rows[0].db);
  console.log("Connected at:", db.rows[0].now);
  console.log("users table:", users.rows[0].users_table || "missing");
} catch (error) {
  console.error("Database check failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

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
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 50000;
  `);

  console.log("Lawyer profile field migration completed successfully.");
} catch (error) {
  console.error("Lawyer profile field migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

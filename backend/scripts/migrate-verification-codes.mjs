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
      ALTER COLUMN verification_token TYPE VARCHAR(10) USING NULL,
      ALTER COLUMN reset_token TYPE VARCHAR(10) USING NULL;
  `);

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP;
  `);

  console.log("Verification code migration completed successfully.");
} catch (error) {
  console.error("Verification code migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

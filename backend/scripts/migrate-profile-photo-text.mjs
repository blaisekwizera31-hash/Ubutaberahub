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
      ALTER COLUMN profile_photo TYPE TEXT;
  `);

  console.log("Profile photo column migrated to TEXT successfully.");
} catch (error) {
  console.error("Profile photo migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

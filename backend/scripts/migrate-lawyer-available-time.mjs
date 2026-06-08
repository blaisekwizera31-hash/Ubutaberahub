import "dotenv/config";
import pool from "../config/db.js";

async function main() {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS available_time VARCHAR(255)
  `);

  console.log("Lawyer available_time column migrated successfully.");
}

main()
  .catch((error) => {
    console.error("Lawyer available_time migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

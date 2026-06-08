import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

try {
  const schemaPath = join(__dirname, "..", "config", "schema.sql");
  const schema = await readFile(schemaPath, "utf8");
  await pool.query(schema);
  console.log("Database schema initialized successfully.");
} catch (error) {
  console.error("Database schema initialization failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

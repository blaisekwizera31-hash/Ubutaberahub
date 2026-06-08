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
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS case_evidence (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
      uploaded_by UUID REFERENCES users(id),
      file_name VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      file_type VARCHAR(100),
      file_size_bytes INTEGER DEFAULT 0,
      notes TEXT,
      uploaded_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("Case evidence table migration completed successfully.");
} catch (error) {
  console.error("Case evidence table migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

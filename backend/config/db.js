import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Blueband',
  database: process.env.DB_NAME || 'ubutaberahub_db',
});

pool.on('connect', () => {
  console.log('✅  PostgreSQL: connected successfully');
});

pool.on('error', (err) => {
  console.error('❌  PostgreSQL: unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'todouser',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tododb',
  password: process.env.DB_PASSWORD || 'todopassword',
  port: process.env.DB_PORT || 5432,
});

// Test the connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;


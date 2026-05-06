import { Pool } from 'pg';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (process.env.DB_LOGGING === 'true') {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }

  return res;
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = () => pool.connect();

/**
 * Close all connections
 */
export const close = () => pool.end();

export default { query, getClient, close };

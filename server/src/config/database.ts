import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

pool.query('SELECT NOW()', (err: Error | null) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

export default pool;

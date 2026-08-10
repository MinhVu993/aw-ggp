import { Pool } from 'pg';

const globalForPg = global as unknown as { pg: Pool };

export const pool =
  globalForPg.pg ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pg = pool;

export default pool;

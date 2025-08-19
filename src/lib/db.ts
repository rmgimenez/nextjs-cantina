import mysql from 'mysql2/promise';

const host = process.env.DATABASE_HOST || 'localhost';
const user = process.env.DATABASE_USER || 'root';
const password = process.env.DATABASE_PASSWORD || '';
const database = process.env.DATABASE_NAME || 'sant31br';

declare global {
  // Allow a global pool to persist across module reloads in development
  // eslint-disable-next-line no-var
  var __mysqlPool: import('mysql2/promise').Pool | undefined;
}

const createPool = () =>
  mysql.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

// Use a global to avoid creating new pools during HMR in development.
const dbPool = globalThis.__mysqlPool ?? createPool();
if (!globalThis.__mysqlPool) globalThis.__mysqlPool = dbPool;

/** Pool singleton (use in API routes / Server Components) */
export { dbPool as pool };

/** Execute a query and return rows */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await dbPool.query(sql, params as any);
  return rows as T;
}

/** Get a connection from the pool (remember to release) */
export async function getConnection() {
  return dbPool.getConnection();
}

/** Simple test helper (optional) */
export async function testConnection(): Promise<void> {
  const conn = await dbPool.getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    conn.release();
  }
}

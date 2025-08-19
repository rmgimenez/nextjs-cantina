import mysql from 'mysql2/promise';

const host = process.env.DATABASE_HOST || 'localhost';
const user = process.env.DATABASE_USER || 'root';
const password = process.env.DATABASE_PASSWORD || '';
const database = process.env.DATABASE_NAME || 'sant31br';

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function getConnection() {
  const p = getPool();
  return p.getConnection();
}

export async function query(sql, params) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

export async function testConnection() {
  const p = getPool();
  const conn = await p.getConnection();
  try {
    const [rows] = await conn.query('SELECT 1 as ok');
    console.log('DB test query result:', rows);
  } finally {
    conn.release();
  }
}

export default { getPool, getConnection, query, testConnection };

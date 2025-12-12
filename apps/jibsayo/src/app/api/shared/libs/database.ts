import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export const getDbPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MARIA_DB_HOST,
      port: Number(process.env.MARIA_DB_PORT),
      user: process.env.MARIA_DB_ID,
      password: process.env.MARIA_DB_PW,
      database: process.env.MARIA_DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
    });
  }
  return pool;
};

export const query = async <T>(sql: string, params?: any[]): Promise<T> => {
  const pool = getDbPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T;
};

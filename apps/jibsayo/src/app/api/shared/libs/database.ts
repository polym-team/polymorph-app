import mysql from 'mysql2/promise';
import { prisma } from './prisma';

/**
 * @deprecated daily-sync 스크립트 호환용. 새 코드에서는 prisma를 직접 사용하세요.
 */
export const getDbPool = () => {
  const globalForDb = globalThis as unknown as { dbPool: mysql.Pool | undefined };
  if (!globalForDb.dbPool) {
    globalForDb.dbPool = mysql.createPool({
      host: process.env.MARIA_DB_HOST,
      port: Number(process.env.MARIA_DB_PORT),
      user: process.env.MARIA_DB_ID,
      password: process.env.MARIA_DB_PW,
      database: process.env.MARIA_DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      timezone: '+09:00',
    });
  }
  return globalForDb.dbPool;
};

/**
 * BigInt/Decimal을 일반 Number로 변환
 */
function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'bigint') {
      result[key] = Number(value);
    } else if (value !== null && typeof value === 'object' && 'toNumber' in (value as object)) {
      result[key] = (value as { toNumber(): number }).toNumber();
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Prisma $queryRawUnsafe 기반 쿼리 실행
 * 기존 mysql2 query()와 동일한 인터페이스 유지 (MySQL은 ? 플레이스홀더 그대로 사용)
 * BigInt, Decimal 결과를 자동으로 Number로 변환
 */
export const query = async <T>(sql: string, params?: unknown[]): Promise<T> => {
  const rows = !params || params.length === 0
    ? await prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql)
    : await prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql, ...params);

  return rows.map(normalizeRow) as T;
};

export { prisma };

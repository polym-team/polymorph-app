import { prisma } from './prisma';

/**
 * BigInt/Decimal을 Number로, Date를 문자열로 변환 (mysql2 dateStrings 호환)
 */
function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'bigint') {
      result[key] = Number(value);
    } else if (value instanceof Date) {
      // mysql2의 dateStrings: true와 동일한 포맷으로 변환
      result[key] = value.toISOString().split('T')[0];
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
    ? await prisma.$queryRawUnsafe(sql)
    : await prisma.$queryRawUnsafe(sql, ...params);

  return (rows as Record<string, unknown>[]).map(normalizeRow) as T;
};

export { prisma };

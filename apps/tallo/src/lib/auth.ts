import { createHash, timingSafeEqual } from 'crypto';

import { prisma } from './prisma';

export type Scope = 'ingest' | 'read';

/** Bearer 토큰 원문을 SHA-256 hex로 해시. DB에는 이 값만 저장한다. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Authorization: Bearer <token> 헤더에서 원문 토큰을 추출. 없으면 null. */
export function extractBearer(req: Request): string | null {
  const header = req.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

/** 상수-시간 문자열 비교(길이 노출 방지 위해 해시 후 비교). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * 발급 API(/api/tokens) 보호용 부트스트랩 관리자 인증.
 * env TALLO_ADMIN_TOKEN 과 Bearer 값을 상수-시간 비교.
 */
export function isAdmin(req: Request): boolean {
  const adminToken = process.env.TALLO_ADMIN_TOKEN;
  if (!adminToken) return false;
  const provided = extractBearer(req);
  if (!provided) return false;
  return safeEqual(provided, adminToken);
}

export type AuthResult =
  | { ok: true; tokenId: number }
  | { ok: false; status: 401 | 403 };

/**
 * 데이터 API(/api/deposits) 보호. Bearer 토큰을 해시해 ApiToken 조회 후 scope 검증.
 * 성공 시 lastUsedAt 갱신(비차단). 실패 사유별 401/403 구분.
 */
export async function authenticateScope(
  req: Request,
  required: Scope
): Promise<AuthResult> {
  const provided = extractBearer(req);
  if (!provided) return { ok: false, status: 401 };

  const record = await prisma.apiToken.findUnique({
    where: { tokenHash: hashToken(provided) },
  });
  if (!record || record.revokedAt) return { ok: false, status: 401 };
  if (record.scope !== required) return { ok: false, status: 403 };

  // 사용 시각 갱신은 인증 결과를 막지 않는다.
  prisma.apiToken
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => undefined);

  return { ok: true, tokenId: record.id };
}

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * OAuth 2.1 authorization code / refresh token 용 해시·생성 유틸.
 *
 * - authorization code, refresh token 은 절대 평문으로 DB 에 저장하지 않는다.
 * - 고엔트로피 opaque 랜덤값을 HMAC-SHA256(value, OAUTH_JWT_SECRET) 으로 해시해 저장한다.
 *   (마스터키를 pepper 로만 사용 — 값 자체는 외부에 노출되지 않고, 새 시크릿도 필요 없다.)
 * - 조회는 deterministic 해시로 unique index lookup, 문자열 비교는 constant-time.
 */

function getSecret(): string {
  const secret = process.env.OAUTH_JWT_SECRET;
  if (!secret) {
    throw new Error('OAUTH_JWT_SECRET 환경변수가 설정되지 않았습니다.');
  }
  return secret;
}

/** 256비트 opaque 토큰/코드를 base64url 로 생성. */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

/** 값을 HMAC-SHA256(value, secret) base64url 해시로 변환 (DB 저장·조회용). */
export function hashToken(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

/** 두 문자열을 constant-time 비교. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * PKCE S256 검증: base64url(SHA256(code_verifier)) === code_challenge.
 */
export function verifyPkceS256(codeVerifier: string, codeChallenge: string): boolean {
  const computed = createHash('sha256').update(codeVerifier).digest('base64url');
  return safeEqual(computed, codeChallenge);
}

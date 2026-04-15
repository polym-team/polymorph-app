import { SignJWT, jwtVerify } from 'jose';
import type { ValidateResult } from './types';

const ISSUER = 'oauth.polymorph.co.kr';

function getSecret(): Uint8Array {
  const secret = process.env.OAUTH_JWT_SECRET;
  if (!secret) {
    throw new Error('OAUTH_JWT_SECRET 환경변수가 설정되지 않았습니다.');
  }
  return new TextEncoder().encode(secret);
}

interface GenerateTokenOptions {
  sub: string;
  email: string;
  name?: string;
  provider: string;
  clientId: string;
  /** 만료 시간 (초). 기본 1시간 */
  expiresInSec?: number;
}

/**
 * JWT 발급 (HS256 대칭키)
 */
export async function generateToken(options: GenerateTokenOptions): Promise<string> {
  const secret = getSecret();
  const expiresIn = options.expiresInSec ?? 3600;

  return await new SignJWT({
    email: options.email,
    name: options.name,
    provider: options.provider,
    clientId: options.clientId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setSubject(options.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secret);
}

/**
 * JWT 검증
 */
export async function validateToken(token: string): Promise<ValidateResult> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, { issuer: ISSUER });

    return {
      valid: true,
      payload: {
        sub: payload.sub as string,
        email: payload.email as string,
        name: payload.name as string | undefined,
        provider: payload.provider as string,
        clientId: payload.clientId as string,
        iss: payload.iss,
        exp: payload.exp,
        iat: payload.iat,
      },
    };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : 'invalid token',
    };
  }
}

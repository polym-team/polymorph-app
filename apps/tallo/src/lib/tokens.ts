import { randomBytes } from 'crypto';

import { hashToken, Scope } from './auth';
import { prisma } from './prisma';

export interface IssuedToken {
  id: number;
  name: string;
  scope: string;
  createdAt: Date;
  token: string; // 원문 — 발급 시 1회만 노출
}

/**
 * 새 API 토큰 발급. 불투명 랜덤 원문을 생성하고 DB에는 SHA-256 해시만 저장한다.
 * 원문(token)은 반환값에서만 확인 가능.
 */
export async function issueApiToken(name: string, scope: Scope): Promise<IssuedToken> {
  const plaintext = randomBytes(32).toString('base64url');
  const record = await prisma.apiToken.create({
    data: { name, scope, tokenHash: hashToken(plaintext) },
    select: { id: true, name: true, scope: true, createdAt: true },
  });
  return { ...record, token: plaintext };
}

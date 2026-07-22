export const dynamic = 'force-dynamic';

import { randomBytes } from 'crypto';

import { hashToken, isAdmin, Scope } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SCOPES: Scope[] = ['ingest', 'read'];

function forbidden(): Response {
  return Response.json(
    { message: '관리자 인증(TALLO_ADMIN_TOKEN)이 필요합니다.' },
    { status: 401 }
  );
}

/**
 * POST /api/tokens — 토큰 발급(관리자 전용).
 * 본문 { name, scope }. 원문 토큰은 응답에서 1회만 노출되고 DB에는 해시로만 저장.
 */
export async function POST(req: Request): Promise<Response> {
  if (!isAdmin(req)) return forbidden();

  let body: { name?: unknown; scope?: unknown };
  try {
    body = (await req.json()) as { name?: unknown; scope?: unknown };
  } catch {
    return Response.json({ message: '잘못된 JSON 본문입니다.' }, { status: 400 });
  }

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    return Response.json({ message: 'name은 필수입니다.' }, { status: 400 });
  }
  if (typeof body.scope !== 'string' || !SCOPES.includes(body.scope as Scope)) {
    return Response.json(
      { message: `scope는 ${SCOPES.join(' | ')} 중 하나여야 합니다.` },
      { status: 400 }
    );
  }

  const plaintext = randomBytes(32).toString('base64url');
  const created = await prisma.apiToken.create({
    data: {
      name: body.name.trim(),
      scope: body.scope,
      tokenHash: hashToken(plaintext),
    },
    select: { id: true, name: true, scope: true, createdAt: true },
  });

  // token(원문)은 이 응답에서만 확인 가능하다.
  return Response.json({ ...created, token: plaintext }, { status: 201 });
}

/**
 * GET /api/tokens — 발급 토큰 목록(관리자 전용). 원문/해시는 절대 반환하지 않는다.
 */
export async function GET(req: Request): Promise<Response> {
  if (!isAdmin(req)) return forbidden();

  const items = await prisma.apiToken.findMany({
    orderBy: { id: 'desc' },
    select: {
      id: true,
      name: true,
      scope: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return Response.json({ items });
}

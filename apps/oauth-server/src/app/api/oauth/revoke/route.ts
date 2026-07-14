import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/oauthTokens';

/**
 * OAuth 2.0 Token Revocation (RFC 7009)
 *
 * POST /api/oauth/revoke  (form-urlencoded 또는 json)
 *   token, token_type_hint?, client_id
 *
 * refresh token 을 폐기한다. 깔끔한 로그아웃을 위해 동일 user+client 의 refresh token 을
 * 모두 폐기한다. access token 은 무상태 JWT 라 폐기 대상이 아니며 만료로 소멸한다.
 * RFC 7009 에 따라 토큰을 못 찾아도 200 을 반환한다.
 */
export async function POST(req: Request) {
  const ct = req.headers.get('content-type') ?? '';
  const params: Record<string, string> = ct.includes('application/json')
    ? ((await req.json().catch(() => ({}))) as Record<string, string>)
    : Object.fromEntries(new URLSearchParams(await req.text()));

  const token = params.token;
  if (token) {
    const rt = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (rt && !rt.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: rt.userId, clientId: rt.clientId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  // RFC 7009: 유효하지 않은 토큰이어도 200
  return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store' } });
}

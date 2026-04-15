import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAllowedRedirectUri } from '@/lib/redirectUri';
import { generateToken } from '@polymorph/shared-auth';

/**
 * Silent SSO 엔드포인트
 *
 * - oauth-server에 NextAuth 세션이 있으면: JWT 발급해서 redirectUri#token=... 으로 리다이렉트
 * - 세션이 없으면: redirectUri로 그냥 리다이렉트 (토큰 없이)
 *
 * 호출 앱은 어떤 경우든 자기 도메인으로 돌아오므로 무한 루프 없이 silent auth 시도 가능.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const redirectUri = searchParams.get('redirectUri');

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'clientId, redirectUri가 필요합니다.' },
      { status: 400 },
    );
  }

  // ClientApp + redirectUri 검증
  const clientApp = await prisma.clientApp.findUnique({ where: { clientId } });
  if (!clientApp || !clientApp.enabled) {
    return NextResponse.json({ error: '허용되지 않은 클라이언트' }, { status: 403 });
  }
  if (!isAllowedRedirectUri(redirectUri, clientApp.allowedRedirectUris)) {
    return NextResponse.json({ error: '허용되지 않은 redirectUri' }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  // 세션 없음 → 토큰 없이 그대로 리다이렉트 (silent fail)
  if (!userId) {
    return NextResponse.redirect(redirectUri);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: { take: 1, orderBy: { createdAt: 'desc' } } },
  });
  if (!user) {
    return NextResponse.redirect(redirectUri);
  }

  const provider = user.accounts[0]?.provider ?? 'unknown';
  const token = await generateToken({
    sub: user.id,
    email: user.email,
    name: user.name ?? undefined,
    provider,
    clientId,
    expiresInSec: clientApp.accessTokenLifetime,
  });

  // URL fragment에 토큰 담아 리다이렉트
  return NextResponse.redirect(`${redirectUri}#token=${encodeURIComponent(token)}`);
}

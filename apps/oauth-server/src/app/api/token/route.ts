import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@polymorph/shared-auth';

/**
 * 로그인 후 호출되어 JWT 토큰을 발급
 * 쿼리 파라미터: clientId, redirectUri
 * 응답: { token, redirectUri }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { clientId: string; redirectUri: string };
  const { clientId, redirectUri } = body;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'clientId, redirectUri가 필요합니다.' },
      { status: 400 },
    );
  }

  // ClientApp 검증
  const clientApp = await prisma.clientApp.findUnique({ where: { clientId } });
  if (!clientApp || !clientApp.enabled) {
    return NextResponse.json({ error: '허용되지 않은 클라이언트입니다.' }, { status: 403 });
  }

  // redirectUri 검증
  const allowedUris = clientApp.allowedRedirectUris.split(',').map(s => s.trim());
  if (!allowedUris.includes(redirectUri)) {
    return NextResponse.json({ error: '허용되지 않은 redirectUri입니다.' }, { status: 403 });
  }

  // User 조회
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: { take: 1, orderBy: { createdAt: 'desc' } } },
  });
  if (!user) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
  }

  const provider = user.accounts[0]?.provider ?? 'unknown';

  // JWT 발급
  const token = await generateToken({
    sub: user.id,
    email: user.email,
    name: user.name ?? undefined,
    provider,
    clientId,
    expiresInSec: clientApp.accessTokenLifetime,
  });

  return NextResponse.json({ token, redirectUri });
}

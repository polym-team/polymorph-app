import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions, LINKING_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 소셜 계정 연동 시작 - 연동 플래그 쿠키 설정
 * Body: { provider: string }
 * 클라이언트는 이 호출 후 signIn(provider)을 직접 실행
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { provider?: string };
  if (!body.provider) {
    return NextResponse.json({ error: 'provider가 필요합니다.' }, { status: 400 });
  }

  // 이미 연결된 프로바이더인지 체크
  const existing = await prisma.account.findFirst({
    where: { userId, provider: body.provider },
  });
  if (existing) {
    return NextResponse.json({ error: '이미 연결된 프로바이더입니다.' }, { status: 400 });
  }

  // 연동 플래그 쿠키 설정 (10분)
  const cookieStore = await cookies();
  cookieStore.set(LINKING_COOKIE, userId, {
    maxAge: 600,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return NextResponse.json({ success: true });
}

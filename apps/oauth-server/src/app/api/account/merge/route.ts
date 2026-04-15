import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions, MERGING_COOKIE } from '@/lib/auth';

/**
 * 계정 병합 시작 - 병합 플래그 쿠키 설정
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

  const cookieStore = await cookies();
  cookieStore.set(MERGING_COOKIE, userId, {
    maxAge: 600,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return NextResponse.json({ success: true });
}

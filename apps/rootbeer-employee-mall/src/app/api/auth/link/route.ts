import { NextResponse } from 'next/server';
import { resolveOnboarding } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

/**
 * 기존 회원 전환 동의(마이그레이션 연결).
 * 조건: 온보딩 상태가 needs_migrate + 이용 주의사항 동의(agree).
 * 처리: 매칭된 기존 users row 에 oauth_user_id 연결 + cautions_agreed_at 기록.
 *       role/주문/filter_preset 은 그대로 승계된다.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { agree?: boolean };
  if (!body.agree) {
    return NextResponse.json({ error: '이용 주의사항 동의가 필요합니다.' }, { status: 400 });
  }

  const ob = await resolveOnboarding();
  if (ob.status === 'anonymous') {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (ob.status === 'linked') {
    return NextResponse.json({ success: true, alreadyLinked: true });
  }
  if (ob.status !== 'needs_migrate') {
    return NextResponse.json({ error: '연결할 기존 계정이 없습니다.' }, { status: 409 });
  }

  // oauthUserId 가 아직 null 인 row 만 연결 (동시성 방어)
  const data: { oauthUserId: string; cautionsAgreedAt: Date; name?: string } = {
    oauthUserId: ob.oauth.sub,
    cautionsAgreedAt: new Date(),
  };
  if (ob.oauth.name) data.name = ob.oauth.name;

  const updated = await prisma.user.updateMany({
    where: { email: ob.candidateEmail, oauthUserId: null },
    data,
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: '이미 처리되었거나 연결할 수 없습니다.' }, { status: 409 });
  }

  return NextResponse.json({ success: true });
}

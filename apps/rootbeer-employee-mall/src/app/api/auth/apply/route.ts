import { NextResponse } from 'next/server';
import { resolveOnboarding, initialRole } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

/**
 * 신규 회원 가입 신청.
 * 조건: 온보딩 상태가 needs_apply + 이용 주의사항 동의(agree).
 * 처리: users row 신규 생성(oauth_user_id 세팅, role=pending 또는 ADMIN이면 admin,
 *       cautions_agreed_at 기록). 관리자 승인 후 이용 가능(pending).
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
  if (ob.status === 'needs_migrate') {
    return NextResponse.json(
      { error: '연결 가능한 기존 계정이 있습니다. 전환 동의로 진행해주세요.', redirect: '/migrate' },
      { status: 409 },
    );
  }

  const role = initialRole(ob.oauth.email, ob.oauth.linkedEmails);
  try {
    await prisma.user.create({
      data: {
        email: ob.oauth.email,
        name: ob.oauth.name,
        oauthUserId: ob.oauth.sub,
        role,
        cautionsAgreedAt: new Date(),
      },
    });
  } catch {
    // email unique 충돌 등(이미 다른 계정에 연결된 이메일)
    return NextResponse.json({ error: '이미 사용 중인 이메일입니다. 관리자에게 문의하세요.' }, { status: 409 });
  }

  return NextResponse.json({ success: true, role });
}

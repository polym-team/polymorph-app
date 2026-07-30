import { NextResponse } from 'next/server';
import { resolveOnboarding } from '@/lib/api-utils';

/**
 * 현재 세션 + 온보딩 상태. 클라이언트(AuthProvider)가 이 값으로 라우팅한다.
 * - anonymous: 비로그인 → 로그인 CTA
 * - linked: 정상 (role=pending 이면 승인 대기 화면)
 * - needs_migrate: /migrate (기존 회원 전환 동의)
 * - needs_apply: /apply (신규 가입 신청)
 */
export async function GET() {
  const ob = await resolveOnboarding();

  if (ob.status === 'anonymous') {
    return NextResponse.json({ authenticated: false, status: 'anonymous' });
  }
  if (ob.status === 'linked') {
    return NextResponse.json({
      authenticated: true,
      status: 'linked',
      user: {
        id: ob.user.id,
        email: ob.user.email,
        name: ob.user.name,
        role: ob.user.role,
      },
    });
  }
  if (ob.status === 'needs_migrate') {
    return NextResponse.json({
      authenticated: true,
      status: 'needs_migrate',
      candidateEmail: ob.candidateEmail,
      oauthEmail: ob.oauth.email,
      name: ob.oauth.name,
    });
  }
  // needs_apply
  return NextResponse.json({
    authenticated: true,
    status: 'needs_apply',
    oauthEmail: ob.oauth.email,
    name: ob.oauth.name,
  });
}

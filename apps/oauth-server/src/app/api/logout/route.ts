import { NextResponse } from 'next/server';

/**
 * 로그아웃 후 호출 앱의 후처리 페이지로 리다이렉트
 * NextAuth signOut은 클라이언트에서 처리
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get('redirectTo') ?? '/';
  return NextResponse.redirect(redirectTo);
}

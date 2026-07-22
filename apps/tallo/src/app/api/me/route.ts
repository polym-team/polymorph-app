export const dynamic = 'force-dynamic';

import { getAuthUser } from '@/lib/user-auth';

/** GET /api/me — 현재 로그인 사용자(웹 쿠키 또는 RN Bearer). 미인증 401. */
export async function GET(req: Request): Promise<Response> {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({ authenticated: true, user });
}

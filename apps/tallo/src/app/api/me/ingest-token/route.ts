export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { issueApiToken } from '@/lib/tokens';
import { getAuthUser } from '@/lib/user-auth';

/**
 * POST /api/me/ingest-token — 로그인(SSO) 사용자가 자기 브릿지 앱용 ingest 토큰을 발급받는다.
 * 앱은 최초 로그인 후 1회 호출해 SecureStore에 저장하고, 이후 POST /api/deposits에 사용한다.
 * 토큰 원문은 이 응답에서만 노출(DB에는 SHA-256 해시만 저장).
 * 재호출 시 같은 사용자(name=`bridge:<userId>`)의 기존 ingest 토큰은 revoke하고 새로 발급한다.
 */
export async function POST(req: Request): Promise<Response> {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ message: '인증이 필요합니다.' }, { status: 401 });
  }

  const name = `bridge:${user.userId}`;

  // 원문 재노출이 불가하므로 기존 토큰은 폐기하고 새로 발급(위생).
  await prisma.apiToken.updateMany({
    where: { name, scope: 'ingest', revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const issued = await issueApiToken(name, 'ingest');
  return Response.json({ token: issued.token }, { status: 201 });
}

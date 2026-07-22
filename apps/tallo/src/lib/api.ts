import { AuthUser, getAuthUser } from './user-auth';

/**
 * 사용자평면 API 인증 가드. 로그인 사용자(웹 쿠키 또는 RN Bearer)를 요구.
 * 실패 시 401 Response 반환 → 호출부에서 `if (x instanceof Response) return x;`.
 */
export async function requireUser(req: Request): Promise<AuthUser | Response> {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ message: '로그인이 필요합니다.' }, { status: 401 });
  }
  return user;
}

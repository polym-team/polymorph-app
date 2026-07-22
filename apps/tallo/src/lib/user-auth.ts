import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';
import { cookies } from 'next/headers';

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  provider: string;
}

async function userFromToken(token: string | undefined | null): Promise<AuthUser | null> {
  if (!token) return null;
  const result = await validateToken(token);
  if (!result.valid || !result.payload) return null;
  return {
    userId: result.payload.sub,
    email: result.payload.email,
    name: result.payload.name,
    provider: result.payload.provider,
  };
}

/** 서버 컴포넌트/라우트에서 쿠키(polymorph_auth) 기반 사용자 조회 (웹). */
export async function getAuthUserFromCookies(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  return userFromToken(cookieStore.get(TOKEN_COOKIE)?.value);
}

/**
 * API 라우트용 사용자 인증. RN은 `Authorization: Bearer <jwt>`, 웹은 쿠키.
 * bearer 우선, 없으면 쿠키.
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const authz = req.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(authz.trim());
  if (match) {
    const user = await userFromToken(match[1].trim());
    if (user) return user;
  }
  return getAuthUserFromCookies();
}

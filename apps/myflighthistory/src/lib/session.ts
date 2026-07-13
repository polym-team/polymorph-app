import { cookies } from 'next/headers';
import { TOKEN_COOKIE } from '@polymorph/shared-auth';

/** 로컬 인증 쿠키에서 polymorph JWT 를 꺼낸다. 없으면 null. */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}

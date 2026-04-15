import { ROUTE_PATH } from '@/shared/consts/route';

const CLIENT_ID = 'jibsayo';

function getOauthBase(): string {
  return (
    process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'http://localhost:3007'
  );
}

export function redirectToLogin(currentOrigin?: string) {
  const origin = currentOrigin ?? window.location.origin;
  // 현재 페이지 위치를 returnTo로 저장 (callback에서 복원)
  if (typeof window !== 'undefined') {
    const returnTo = window.location.pathname + window.location.search;
    if (returnTo && returnTo !== ROUTE_PATH.AUTH_CALLBACK) {
      sessionStorage.setItem('auth_return_to', returnTo);
    }
  }
  const redirectUri = `${origin}${ROUTE_PATH.AUTH_CALLBACK}`;
  const oauth = getOauthBase();
  window.location.href = `${oauth}/login?clientId=${CLIENT_ID}&redirectUri=${encodeURIComponent(redirectUri)}`;
}

export function redirectToAccount(currentOrigin?: string) {
  const origin = currentOrigin ?? window.location.origin;
  const returnUrl = `${origin}${ROUTE_PATH.HOME}`;
  const oauth = getOauthBase();
  window.location.href = `${oauth}/account?clientId=${CLIENT_ID}&returnUrl=${encodeURIComponent(returnUrl)}`;
}

export async function logout(currentOrigin?: string) {
  const origin = currentOrigin ?? window.location.origin;
  // 1. 로컬 쿠키 제거
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // 무시
  }
  // 2. oauth-server 세션도 종료 (글로벌 로그아웃)
  const oauth = getOauthBase();
  const returnUrl = `${origin}${ROUTE_PATH.HOME}`;
  window.location.href = `${oauth}/api/logout?returnTo=${encodeURIComponent(returnUrl)}`;
}

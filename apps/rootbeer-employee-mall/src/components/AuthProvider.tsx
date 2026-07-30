'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export type UserRole = 'pending' | 'user' | 'admin';
export interface LinkedUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

type OnboardingStatus = 'loading' | 'anonymous' | 'linked' | 'needs_migrate' | 'needs_apply';

interface AuthSnapshot {
  status: OnboardingStatus;
  user: LinkedUser | null;
  candidateEmail?: string;
  oauthEmail?: string;
  name?: string;
}

// 모듈 스토어 (React context를 쓰지 않음 — 모노레포 @types/react 이중 사본 상황에서
// createContext Provider 의 JSX 타입 충돌을 피하기 위해 useSyncExternalStore 로 구독).
let snapshot: AuthSnapshot = { status: 'loading', user: null };
const listeners = new Set<() => void>();

function setSnapshot(next: AuthSnapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
function getSnapshot() {
  return snapshot;
}

let inflight = false;
/** /api/auth/me 로 세션+온보딩 상태 갱신 */
export async function refreshSession() {
  if (inflight) return;
  inflight = true;
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    const d = await res.json();
    setSnapshot({
      status: d.status ?? 'anonymous',
      user: d.user ?? null,
      candidateEmail: d.candidateEmail,
      oauthEmail: d.oauthEmail,
      name: d.name,
    });
  } catch {
    setSnapshot({ status: 'anonymous', user: null });
  } finally {
    inflight = false;
  }
}

const OAUTH_URL =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';
const CLIENT_ID = 'rootbeer-employee-mall';

/** oauth-server 로그인으로 리다이렉트 */
export function login(returnTo?: string) {
  const origin = window.location.origin;
  const redirectUri = `${origin}/auth/callback`;
  if (returnTo) sessionStorage.setItem('auth_return_to', returnTo);
  window.location.href = `${OAUTH_URL}/login?clientId=${CLIENT_ID}&redirectUri=${encodeURIComponent(redirectUri)}`;
}

/** 로컬 쿠키 제거 후 oauth-server SSO 로그아웃 */
export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    /* ignore */
  }
  window.location.href = `${OAUTH_URL}/logout?returnUrl=${encodeURIComponent(window.location.origin)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const started = useRef(false);
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    refreshSession();
  }, []);

  // 온보딩 라우팅: 미연결이면 전환/가입 페이지로 유도
  useEffect(() => {
    if (snap.status === 'needs_migrate' && pathname !== '/migrate') {
      router.replace('/migrate');
    } else if (snap.status === 'needs_apply' && pathname !== '/apply') {
      router.replace('/apply');
    }
  }, [snap.status, pathname, router]);

  return <>{children}</>;
}

/** 온보딩 상태까지 포함한 원시 스냅샷 (/migrate·/apply 용) */
export function useAuth(): AuthSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * next-auth 호환 useSession. 기존 페이지가 최소 변경으로 동작하도록 shape 유지.
 * needs_migrate/apply 는 리다이렉트 중이라 'loading'으로 취급(로그인 CTA 깜빡임 방지).
 */
export function useSession(): {
  data: { user: LinkedUser } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
} {
  const { status, user } = useAuth();
  if (status === 'linked' && user) {
    return { data: { user }, status: 'authenticated' };
  }
  if (status === 'anonymous') {
    return { data: null, status: 'unauthenticated' };
  }
  return { data: null, status: 'loading' };
}

'use client';

import { APP_THEMES } from '@package/theme/registry';
import { AppSymbol } from '@package/theme/symbols';
import { Alert } from '@package/ui';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const CONSTELLATION = [
  'jibsayo',
  'okra',
  'autto',
  'bookmark-share',
  'official-website',
  'direct-feedback',
];

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function KakaoMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1C4.58 1 1 3.85 1 7.36c0 2.27 1.51 4.27 3.79 5.4l-.97 3.55c-.09.32.27.58.55.4l4.26-2.83c.12.01.24.01.37.01 4.42 0 8-2.85 8-6.36S13.42 1 9 1z" fill="#191919" />
    </svg>
  );
}

export function LoginClient() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const clientId = searchParams.get('clientId') ?? '';
  const redirectUri = searchParams.get('redirectUri') ?? '';
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const nextAuthError = searchParams.get('error');
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  // self-login 모드: clientId/redirectUri 없이 oauth-server 자체에 로그인
  const isSelfLogin = !clientId && !redirectUri;

  useEffect(() => {
    if (nextAuthError) {
      setError(`인증 오류: ${nextAuthError}`);
    }
  }, [nextAuthError]);

  // self-login 모드에서 이미 로그인되어 있으면 바로 callbackUrl로 이동
  useEffect(() => {
    if (isSelfLogin && status === 'authenticated') {
      window.location.replace(callbackUrl);
    }
  }, [isSelfLogin, status, callbackUrl]);

  // 앱 통합 모드: 이미 로그인된 상태에서 페이지 진입 → 바로 토큰 발급 + 리다이렉트 (1회만)
  useEffect(() => {
    if (status !== 'authenticated' || !clientId || !redirectUri) return;
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    setIssuing(true);
    (async () => {
      try {
        const res = await fetch('/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, redirectUri }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(
            res.status === 401
              ? '세션이 만료되었습니다. 로그아웃 후 다시 로그인해주세요.'
              : data.error || '토큰 발급 실패'
          );
          setIssuing(false);
          return;
        }
        // URL Fragment에 토큰을 담아 리다이렉트 (브라우저 히스토리에 안 남음)
        window.location.href = `${data.redirectUri}#token=${encodeURIComponent(data.token)}`;
      } catch {
        setError('네트워크 오류');
        setIssuing(false);
      }
    })();
  }, [status, clientId, redirectUri]);

  // 앱 통합 모드인데 파라미터가 부족하면 에러
  if (!isSelfLogin && (!clientId || !redirectUri)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
          <Alert variant="danger">
            잘못된 접근입니다. (clientId 또는 redirectUri 누락)
          </Alert>
        </div>
      </div>
    );
  }

  if (status === 'loading' || (session && issuing)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          로그인 중…
        </div>
      </div>
    );
  }

  const app = clientId ? APP_THEMES.find((t) => t.app === clientId) : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid-cols-[1.05fr_1fr]">
        {/* 브랜드 패널 (데스크톱) */}
        <div className="relative hidden flex-col bg-primary p-10 text-primary-foreground md:flex">
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15">
              <AppSymbol name="oauth-server" className="h-4 w-4" />
            </span>
            Polymorph
          </div>
          <h2 className="mt-9 text-2xl font-bold leading-snug tracking-tight text-balance">
            하나의 계정으로
            <br />
            모든 서비스
          </h2>
          <p className="mt-2.5 max-w-[34ch] text-sm opacity-80">
            Polymorph 통합 인증. 한 번 로그인하면 연결된 모든 앱을 오갈 수 있어요.
          </p>
          <div className="mt-auto pt-10">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-widest opacity-70">
              연결된 서비스
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CONSTELLATION.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-xs"
                >
                  <AppSymbol name={name} className="h-3.5 w-3.5" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 로그인 폼 */}
        <div className="flex flex-col gap-4 p-8 sm:p-10">
          {/* 모바일 워드마크 */}
          <div className="flex items-center gap-2 text-primary md:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12">
              <AppSymbol name="oauth-server" className="h-4 w-4" />
            </span>
            <span className="text-base font-bold tracking-tight">Polymorph</span>
          </div>

          {app && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm">
              <AppSymbol
                name={app.app}
                className="h-4 w-4"
                style={{ color: app.hex }}
              />
              <span>
                <b className="font-semibold">{app.label}</b>에 로그인합니다
              </span>
            </div>
          )}

          <div>
            <h1 className="text-xl font-semibold tracking-tight">로그인</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              소셜 계정으로 계속하세요.
            </p>
          </div>

          {error && (
            <Alert variant="danger">
              <span>
                {error}
                {status === 'authenticated' && (
                  <button
                    onClick={() =>
                      signOut({ callbackUrl: window.location.href })
                    }
                    className="ml-2 underline"
                  >
                    로그아웃
                  </button>
                )}
              </span>
            </Alert>
          )}

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() =>
                signIn('google', { callbackUrl: window.location.href })
              }
              className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-card text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <GoogleMark />
              Google로 계속하기
            </button>
            <button
              onClick={() =>
                signIn('kakao', { callbackUrl: window.location.href })
              }
              className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-[#FEE500] text-sm font-medium text-[#191919] transition hover:brightness-95"
            >
              <KakaoMark />
              카카오로 계속하기
            </button>
          </div>

          <p className="mt-1 text-center text-xs text-muted-foreground">
            로그인 시 Polymorph 통합 계정이 생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

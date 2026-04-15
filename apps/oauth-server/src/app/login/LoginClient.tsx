'use client';

import { signIn, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function LoginClient() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const clientId = searchParams.get('clientId') ?? '';
  const redirectUri = searchParams.get('redirectUri') ?? '';
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 로그인된 상태에서 페이지 진입 → 바로 토큰 발급 + 리다이렉트
  useEffect(() => {
    if (status !== 'authenticated' || !clientId || !redirectUri) return;
    if (issuing) return;

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
          setError(data.error || '토큰 발급 실패');
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
  }, [status, clientId, redirectUri, issuing]);

  if (!clientId || !redirectUri) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-white p-6 text-sm text-red-500 shadow">
          잘못된 접근입니다. (clientId 또는 redirectUri 누락)
        </div>
      </div>
    );
  }

  if (status === 'loading' || (session && issuing)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">로그인 중...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Polymorph</h1>
          <p className="mt-1 text-sm text-gray-500">통합 로그인</p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => signIn('google', { callbackUrl: window.location.href })}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Google로 로그인
          </button>

          <button
            onClick={() => signIn('kakao', { callbackUrl: window.location.href })}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#191919] shadow-sm transition hover:brightness-95"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1C4.58 1 1 3.85 1 7.36c0 2.27 1.51 4.27 3.79 5.4l-.97 3.55c-.09.32.27.58.55.4l4.26-2.83c.12.01.24.01.37.01 4.42 0 8-2.85 8-6.36S13.42 1 9 1z" fill="#191919"/>
            </svg>
            카카오로 로그인
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          로그인 시 Polymorph 통합 계정이 생성됩니다
        </p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * OAuth 콜백 페이지
 * - URL fragment에 token 있으면: 쿠키 저장 → returnTo로 이동
 * - token 없으면 (silent SSO 실패 등): 조용히 returnTo 또는 홈으로 이동
 * 어떤 경우든 사용자에게 멈춰 보이는 화면을 보여주지 않음
 */
export function CallbackClient() {
  const [error, setError] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    function getReturnTo(): string {
      const search = new URLSearchParams(window.location.search);
      let returnTo = search.get('returnTo');
      if (!returnTo) returnTo = sessionStorage.getItem('auth_return_to');
      sessionStorage.removeItem('auth_return_to');
      const isSafe = !!returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//');
      return isSafe ? returnTo! : '/';
    }

    const fragment = window.location.hash.slice(1);
    const params = new URLSearchParams(fragment);
    const token = params.get('token');

    // token 없음 (silent SSO 실패 등) → 조용히 returnTo로 이동
    if (!token) {
      window.location.replace(getReturnTo());
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          // 토큰 검증 실패 → 일단 홈으로 (사용자 차단보다 진입 우선)
          window.location.replace(getReturnTo());
          return;
        }
        window.location.replace(getReturnTo());
      } catch {
        setError('네트워크 오류');
      }
    })();
  }, []);

  // 네트워크 오류만 화면 표시, 그 외는 즉시 리다이렉트
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}{' '}
          <a href="/" className="underline">홈으로</a>
        </div>
      </div>
    );
  }

  // 처리 중 - 빈 화면 대신 미니멀 로딩 표시
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
      잠시만요...
    </div>
  );
}

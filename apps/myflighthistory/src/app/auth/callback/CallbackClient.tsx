'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/**
 * OAuth 콜백 페이지
 * - URL fragment에 token 있으면: 쿠키 저장 → returnTo로 이동
 * - token 없으면 (silent SSO 실패 등): 조용히 returnTo 또는 홈으로 이동
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
          window.location.replace(getReturnTo());
          return;
        }
        window.location.replace(getReturnTo());
      } catch {
        setError('네트워크 오류');
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}{' '}
          <Link href="/" className="underline">홈으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
      잠시만요...
    </div>
  );
}

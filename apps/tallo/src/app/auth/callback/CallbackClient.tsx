'use client';

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
      const returnTo = search.get('returnTo');
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
        window.location.replace(getReturnTo());
        if (!res.ok) return;
      } catch {
        setError('네트워크 오류');
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {!error && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
        {error ?? '잠시만요…'}
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';

// oauth-server 가 #token=<jwt> fragment 로 리다이렉트 → 쿠키 저장 후 returnTo 로 이동.
export default function AuthCallback() {
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get('token');
    const returnTo =
      new URLSearchParams(window.location.search).get('returnTo') || '/';
    if (!token) {
      window.location.replace('/');
      return;
    }
    fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(() => window.location.replace(returnTo));
  }, []);

  return <main style={{ padding: 24, fontFamily: 'sans-serif' }}>로그인 처리 중…</main>;
}

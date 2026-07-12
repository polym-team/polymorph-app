'use client';

import { useEffect } from 'react';
import { CLIENT_ID, OAUTH_SERVER_URL } from '@/lib/oauth';

/**
 * 로그인 진입점: oauth-server로 즉시 리다이렉트
 */
export default function LoginPage() {
  useEffect(() => {
    const redirectUri = `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent('/')}`;
    const url = `${OAUTH_SERVER_URL}/login?clientId=${CLIENT_ID}&redirectUri=${encodeURIComponent(redirectUri)}`;
    window.location.replace(url);
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-400">
      로그인 페이지로 이동 중...
    </div>
  );
}

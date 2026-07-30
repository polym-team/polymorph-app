'use client';

import { Button } from '@package/ui';
import { useEffect, useState } from 'react';

export function TestClient() {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;

  const loginUrl = `/login?clientId=test&redirectUri=${encodeURIComponent(`${origin}/test/callback`)}`;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">OAuth 테스트</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          OAuth 로그인 흐름을 시뮬레이션합니다.
        </p>

        <div className="mt-6 flex flex-col gap-3 rounded-lg bg-muted/40 p-4 text-xs">
          <div>
            <span className="font-medium text-muted-foreground">clientId:</span>{' '}
            <code className="rounded border border-border bg-card px-1.5 py-0.5">test</code>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">redirectUri:</span>{' '}
            <code className="break-all rounded border border-border bg-card px-1.5 py-0.5">
              {origin}/test/callback
            </code>
          </div>
        </div>

        <a href={loginUrl} className="mt-6 block">
          <Button variant="primary" className="w-full">
            로그인 시작
          </Button>
        </a>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          로그인 성공 시 콜백 페이지에서 발급된 JWT를 확인할 수 있습니다.
        </p>

        <div className="mt-6 border-t border-border pt-6">
          <a href="/account" className="block">
            <Button variant="outline" className="w-full">
              📎 계정 관리 (연동/해제)
            </Button>
          </a>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            로그인된 상태에서 다른 소셜 계정을 추가 연결할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

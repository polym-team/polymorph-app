'use client';

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
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">OAuth 테스트</h1>
        <p className="mt-2 text-sm text-gray-500">
          OAuth 로그인 흐름을 시뮬레이션합니다.
        </p>

        <div className="mt-6 space-y-3 rounded-lg bg-gray-50 p-4 text-xs">
          <div>
            <span className="font-medium text-gray-500">clientId:</span>{' '}
            <code className="rounded bg-white px-1.5 py-0.5">test</code>
          </div>
          <div>
            <span className="font-medium text-gray-500">redirectUri:</span>{' '}
            <code className="break-all rounded bg-white px-1.5 py-0.5">{origin}/test/callback</code>
          </div>
        </div>

        <a
          href={loginUrl}
          className="mt-6 block w-full rounded-lg bg-gray-900 py-3 text-center text-sm font-medium text-white transition hover:bg-gray-800"
        >
          로그인 시작
        </a>

        <p className="mt-4 text-center text-xs text-gray-400">
          로그인 성공 시 콜백 페이지에서 발급된 JWT를 확인할 수 있습니다.
        </p>

        <div className="mt-6 border-t pt-6">
          <a
            href="/account"
            className="block rounded-lg border bg-gray-50 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            📎 계정 관리 (연동/해제)
          </a>
          <p className="mt-2 text-center text-xs text-gray-400">
            로그인된 상태에서 다른 소셜 계정을 추가 연결할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

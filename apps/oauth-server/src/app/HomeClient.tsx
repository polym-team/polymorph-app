'use client';

import { signIn, useSession } from 'next-auth/react';
import { LogIn, Settings, Shield } from 'lucide-react';

export function HomeClient() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const userName = session?.user?.name ?? session?.user?.email;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Polymorph</h1>
          <p className="mt-1 text-sm text-gray-500">통합 인증 서비스</p>
        </div>

        <div className="mt-8 space-y-3">
          {status === 'loading' ? (
            <div className="text-center text-sm text-gray-400">로딩 중...</div>
          ) : isAuthenticated ? (
            <>
              <div className="rounded-lg bg-gray-50 px-4 py-3 text-center text-sm">
                <span className="text-gray-500">로그인 됨: </span>
                <span className="font-medium text-gray-800">{userName}</span>
              </div>
              <a
                href="/account"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Settings size={16} />
                계정 관리
              </a>
            </>
          ) : (
            <button
              onClick={() => signIn(undefined, { callbackUrl: '/account' })}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              <LogIn size={16} />
              로그인하기
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Polymorph 서비스 전용 인증 서버입니다.
        </p>
      </div>
    </div>
  );
}

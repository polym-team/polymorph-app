'use client';

import { AppSymbol } from '@package/theme/symbols';
import { Button } from '@package/ui';
import { signIn, useSession } from 'next-auth/react';
import { LogIn, Settings } from 'lucide-react';

export function HomeClient() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const userName = session?.user?.name ?? session?.user?.email;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <AppSymbol name="oauth-server" className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Polymorph</h1>
          <p className="mt-1 text-sm text-muted-foreground">통합 인증 서비스</p>
        </div>

        <div className="mt-8 space-y-3">
          {status === 'loading' ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              로딩 중…
            </div>
          ) : isAuthenticated ? (
            <>
              <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">로그인됨</span>
                <span className="font-medium">{userName}</span>
              </div>
              <a href="/account" className="block">
                <Button variant="primary" className="w-full gap-2">
                  <Settings size={16} />
                  계정 관리
                </Button>
              </a>
            </>
          ) : (
            <Button
              variant="primary"
              className="w-full gap-2"
              onClick={() => signIn(undefined, { callbackUrl: '/account' })}
            >
              <LogIn size={16} />
              로그인하기
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Polymorph 서비스 전용 인증 서버입니다.
        </p>
      </div>
    </div>
  );
}

import { AppSymbol } from '@package/theme/symbols';
import { Button } from '@package/ui';

import { getAuthUserFromCookies } from '@/lib/user-auth';

export const dynamic = 'force-dynamic';

const OAUTH = process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export default async function Home() {
  const user = await getAuthUserFromCookies();
  const loginUrl = `${OAUTH}/login?clientId=tallo&redirectUri=${encodeURIComponent(`${BASE}/auth/callback`)}`;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <AppSymbol name="tallo" className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Tallo</h1>
        <p className="mt-1 text-sm text-muted-foreground">입금 원장 서비스</p>

        {user ? (
          <>
            <div className="my-6 flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-medium">{user.name ?? user.email}</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a href="/accounts" className="flex-1">
                <Button variant="primary" className="w-full">
                  내 계좌
                </Button>
              </a>
              <a href="/deposits" className="flex-1">
                <Button variant="outline" className="w-full">
                  입금 내역
                </Button>
              </a>
            </div>
            <a
              href="/api/auth/logout"
              className="mt-4 inline-block text-xs text-muted-foreground underline"
            >
              로그아웃
            </a>
          </>
        ) : (
          <a href={loginUrl} className="mt-6 block">
            <Button variant="primary" className="w-full">
              로그인
            </Button>
          </a>
        )}
      </div>
    </main>
  );
}

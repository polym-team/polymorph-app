import { getAuthUserFromCookies } from '@/lib/user-auth';
import { prisma } from '@/lib/prisma';
import { AccountsClient } from './AccountsClient';

export const dynamic = 'force-dynamic';

const OAUTH = process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export default async function AccountsPage() {
  const user = await getAuthUserFromCookies();

  if (!user) {
    const loginUrl = `${OAUTH}/login?clientId=tallo&redirectUri=${encodeURIComponent(`${BASE}/auth/callback`)}`;
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            내 계좌 관리는 로그인 후 사용할 수 있습니다.
          </p>
          <a href={loginUrl} className="mt-6 inline-block w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground">
            로그인
          </a>
        </div>
      </main>
    );
  }

  const accounts = await prisma.account.findMany({
    where: { userId: user.userId },
    orderBy: { id: 'desc' },
    select: {
      id: true,
      bank: true,
      accountNumber: true,
      label: true,
      notificationConfirmedAt: true,
    },
  });

  const items = accounts.map((a) => ({
    id: a.id,
    bank: a.bank,
    accountNumber: a.accountNumber,
    label: a.label,
    confirmedAt: a.notificationConfirmedAt ? a.notificationConfirmedAt.toISOString() : null,
  }));

  return <AccountsClient userName={user.name ?? user.email} accounts={items} />;
}

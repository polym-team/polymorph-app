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
      <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
        <h1>Tallo</h1>
        <p>
          <a href={loginUrl}>로그인</a>이 필요합니다.
        </p>
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

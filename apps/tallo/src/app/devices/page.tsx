import { getAuthUserFromCookies } from '@/lib/user-auth';
import { prisma } from '@/lib/prisma';
import { DevicesClient } from './DevicesClient';

export const dynamic = 'force-dynamic';

const OAUTH = process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export default async function DevicesPage() {
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

  const devices = await prisma.device.findMany({
    where: { userId: user.userId },
    orderBy: { id: 'desc' },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      platform: true,
      notificationConfirmedAt: true,
    },
  });

  const items = devices.map((d) => ({
    id: d.id,
    name: d.name,
    phoneNumber: d.phoneNumber,
    platform: d.platform,
    confirmedAt: d.notificationConfirmedAt ? d.notificationConfirmedAt.toISOString() : null,
  }));

  return <DevicesClient userName={user.name ?? user.email} devices={items} />;
}

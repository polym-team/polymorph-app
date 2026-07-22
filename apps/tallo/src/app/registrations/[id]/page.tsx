import { getAuthUserFromCookies } from '@/lib/user-auth';
import { prisma } from '@/lib/prisma';
import { RegistrationClient } from './RegistrationClient';

export const dynamic = 'force-dynamic';

export default async function RegistrationPage({ params }: { params: { id: string } }) {
  const user = await getAuthUserFromCookies();
  if (!user) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
        <p>로그인이 필요합니다. <a href="/devices">디바이스</a></p>
      </main>
    );
  }

  const id = Number(params.id);
  const session = Number.isInteger(id)
    ? await prisma.registrationSession.findUnique({ where: { id } })
    : null;

  if (!session || session.userId !== user.userId) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
        <p>세션을 찾을 수 없습니다. <a href="/devices">디바이스로</a></p>
      </main>
    );
  }

  return (
    <RegistrationClient
      id={session.id}
      bank={session.bank}
      phoneNumber={session.phoneNumber}
      expiresAt={session.expiresAt.toISOString()}
    />
  );
}

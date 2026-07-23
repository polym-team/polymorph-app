import { getAuthUserFromCookies } from '@/lib/user-auth';

export const dynamic = 'force-dynamic';

const OAUTH = process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export default async function Home() {
  const user = await getAuthUserFromCookies();
  const loginUrl = `${OAUTH}/login?clientId=tallo&redirectUri=${encodeURIComponent(`${BASE}/auth/callback`)}`;

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', lineHeight: 1.6 }}>
      <h1>Tallo</h1>
      <p>입금 원장 서비스.</p>
      {user ? (
        <div>
          <p>
            안녕하세요, <strong>{user.name ?? user.email}</strong> 님
            <span style={{ color: '#888' }}> ({user.userId})</span>
          </p>
          <p>
            <a href="/accounts">내 계좌</a>
            {' · '}
            <a href="/api/auth/logout">로그아웃</a>
          </p>
        </div>
      ) : (
        <p>
          <a href={loginUrl}>로그인</a>
        </p>
      )}
    </main>
  );
}

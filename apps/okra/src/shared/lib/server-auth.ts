import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';
import { prisma } from './prisma';

export async function getServerUser() {
  const cookieStore = await cookies();
  const isSecure = process.env.NEXTAUTH_URL?.startsWith('https');
  const cookieName = isSecure
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  const decoded = await decode({
    token,
    secret: process.env.NEXTAUTH_SECRET!,
    salt: cookieName,
  });

  if (!decoded?.googleId) return null;

  const user = await prisma.user.findUnique({
    where: { googleId: decoded.googleId as string },
  });

  return user;
}

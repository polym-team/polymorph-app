import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from './prisma';

export async function getAuthUser(request: NextRequest) {
  const isSecure = process.env.NEXTAUTH_URL?.startsWith('https');
  const token = await (getToken as any)({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isSecure,
  });

  if (!token?.githubId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { githubId: token.githubId as number },
  });

  return user;
}

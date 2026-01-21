import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

// GET /api/organizations - List user's organizations
export async function GET(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  console.log('[GET /api/organizations] NEXTAUTH_SECRET exists:', !!secret);
  console.log('[GET /api/organizations] Cookies:', request.cookies.getAll().map(c => c.name));

  const token = await (getToken as any)({ req: request, secret });
  console.log('[GET /api/organizations] Token:', token ? 'found' : 'not found', token?.githubId ? `githubId: ${token.githubId}` : '');

  if (!token?.githubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { githubId: token.githubId as number },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: dbUser.id },
    include: {
      organization: true,
    },
  });

  const organizations = memberships.map((m) => ({
    ...m.organization,
    role: m.role,
  }));

  return NextResponse.json(organizations);
}

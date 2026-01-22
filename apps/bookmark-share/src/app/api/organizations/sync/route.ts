import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { getUserOrganizations, getOrgMembership } from '@/lib/github';
import type { MemberRole } from '@prisma/client';

// POST /api/organizations/sync - Sync user's organizations from GitHub
export async function POST(request: NextRequest) {
  const token = await (getToken as any)({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  if (!token?.githubId || !token?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const githubId = token.githubId as number;
  const accessToken = token.accessToken as string;

  // Find user in database
  const dbUser = await prisma.user.findUnique({
    where: { githubId },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    // Fetch organizations from GitHub
    const orgs = await getUserOrganizations(accessToken);
    console.log(`[Sync] Found ${orgs.length} organizations for user ${dbUser.username}`);

    const syncedOrgs = [];

    for (const org of orgs) {
      // Upsert organization
      const dbOrg = await prisma.organization.upsert({
        where: { githubId: org.id },
        update: {
          login: org.login,
          avatarUrl: org.avatar_url,
        },
        create: {
          githubId: org.id,
          login: org.login,
          avatarUrl: org.avatar_url,
        },
      });

      // Get membership role
      const membership = await getOrgMembership(accessToken, org.login, dbUser.username);
      const role: MemberRole = membership?.role === 'admin' ? 'OWNER' : 'MEMBER';

      // Upsert membership
      await prisma.organizationMember.upsert({
        where: {
          userId_organizationId: {
            userId: dbUser.id,
            organizationId: dbOrg.id,
          },
        },
        update: { role },
        create: {
          userId: dbUser.id,
          organizationId: dbOrg.id,
          role,
        },
      });

      syncedOrgs.push({
        id: dbOrg.id,
        login: dbOrg.login,
        role,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedOrgs.length} organizations`,
      organizations: syncedOrgs,
    });
  } catch (error) {
    console.error('[Sync] Error syncing organizations:', error);
    return NextResponse.json(
      { error: 'Failed to sync organizations' },
      { status: 500 }
    );
  }
}

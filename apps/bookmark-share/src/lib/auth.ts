import NextAuth, { type DefaultSession } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { prisma } from './prisma';
import { getUserOrganizations, getOrgMembership } from './github';
import type { MemberRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      githubId?: number;
      username?: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email read:org',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'github' && profile) {
        const githubId = (profile as { id?: number }).id;
        const login = (profile as { login?: string }).login;
        const avatarUrl = (profile as { avatar_url?: string }).avatar_url;
        const email = profile.email;

        if (!githubId || !login) return false;

        // Upsert user in database
        await prisma.user.upsert({
          where: { githubId },
          update: {
            username: login,
            email: email ?? undefined,
            avatarUrl: avatarUrl ?? undefined,
          },
          create: {
            githubId,
            username: login,
            email: email ?? undefined,
            avatarUrl: avatarUrl ?? undefined,
          },
        });

        // Sync organizations
        if (account.access_token) {
          try {
            const orgs = await getUserOrganizations(account.access_token);
            const dbUser = await prisma.user.findUnique({
              where: { githubId },
            });

            if (dbUser) {
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
                const membership = await getOrgMembership(
                  account.access_token,
                  org.login,
                  login
                );

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
              }
            }
          } catch (error) {
            console.error('Failed to sync organizations:', error);
          }
        }
      }
      return true;
    },
    async session({ session, token }) {
      const githubId = token.githubId as number | undefined;

      if (githubId) {
        const dbUser = await prisma.user.findUnique({
          where: { githubId },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.githubId = dbUser.githubId;
          session.user.username = dbUser.username;
          if (dbUser.email) session.user.email = dbUser.email;
          if (dbUser.avatarUrl) session.user.image = dbUser.avatarUrl;
        }
      }

      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }

      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const githubId = (profile as { id?: number }).id;
        token.githubId = githubId;
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
});

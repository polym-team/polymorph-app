import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from './prisma';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      googleId?: string;
    } & DefaultSession['user'];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile) {
        const googleId = profile.sub;
        const email = profile.email;
        const name = profile.name;
        const avatarUrl = profile.picture;

        if (!googleId || !email) return false;

        await prisma.user.upsert({
          where: { googleId },
          update: {
            email,
            name: name ?? email,
            avatarUrl: avatarUrl ?? undefined,
          },
          create: {
            googleId,
            email,
            name: name ?? email,
            avatarUrl: avatarUrl ?? undefined,
          },
        });
      }
      return true;
    },
    async session({ session, token }) {
      const googleId = token.googleId as string | undefined;

      if (googleId) {
        const dbUser = await prisma.user.findUnique({
          where: { googleId },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.googleId = dbUser.googleId;
          if (dbUser.email) session.user.email = dbUser.email;
          if (dbUser.name) session.user.name = dbUser.name;
          if (dbUser.avatarUrl) session.user.image = dbUser.avatarUrl;
        }
      }

      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.googleId = profile.sub;
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
  trustHost: true,
});

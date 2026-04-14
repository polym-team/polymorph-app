import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user: googleUser, account }) {
      if (!googleUser.email) return false;

      const googleId = account?.providerAccountId ?? null;

      await prisma.user.upsert({
        where: { email: googleUser.email },
        update: {
          name: googleUser.name ?? '',
          profileImage: googleUser.image ?? null,
          googleId,
        },
        create: {
          email: googleUser.email,
          name: googleUser.name ?? '',
          profileImage: googleUser.image ?? null,
          googleId,
        },
      });

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import { ADMIN_EMAIL } from '@/types';

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
      const role = googleUser.email === ADMIN_EMAIL ? 'admin' : 'pending';

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
          role,
        },
      });

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

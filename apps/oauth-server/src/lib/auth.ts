import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import { prisma } from './prisma';

const providers: NextAuthOptions['providers'] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  providers.push(
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user: socialUser, account }) {
      if (!account) return false;

      const provider = account.provider;
      const providerAccountId = account.providerAccountId;

      // 카카오는 비즈니스 인증 전까지 이메일 동의 권한이 없으므로 가짜 이메일 생성
      const email =
        socialUser.email ?? `${provider}_${providerAccountId}@no-email.polymorph.co.kr`;

      // 1. 기존 Account 연결이 있는지 확인
      const existingAccount = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });

      if (existingAccount) {
        // 프로필 정보 업데이트
        await prisma.user.update({
          where: { id: existingAccount.userId },
          data: {
            name: socialUser.name ?? existingAccount.user.name,
            profileImage: socialUser.image ?? existingAccount.user.profileImage,
          },
        });
        return true;
      }

      // 2. 같은 이메일을 가진 User가 있는지 확인 (계정 자동 연동)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // 같은 이메일 → 기존 User에 새 Account 연결
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            provider,
            providerAccountId,
          },
        });
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: socialUser.name ?? existingUser.name,
            profileImage: socialUser.image ?? existingUser.profileImage,
          },
        });
        return true;
      }

      // 3. 신규 User + Account 생성
      await prisma.user.create({
        data: {
          email,
          name: socialUser.name ?? null,
          profileImage: socialUser.image ?? null,
          accounts: {
            create: { provider, providerAccountId },
          },
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
          (session.user as { id?: string }).id = dbUser.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

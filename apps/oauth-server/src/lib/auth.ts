import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export const LINKING_COOKIE = 'oauth_linking_user_id';
export const MERGING_COOKIE = 'oauth_merging_user_id';

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

      // 0. 연동/병합 모드 확인
      let linkingUserId: string | undefined;
      let mergingUserId: string | undefined;
      try {
        const cookieStore = await cookies();
        linkingUserId = cookieStore.get(LINKING_COOKIE)?.value;
        mergingUserId = cookieStore.get(MERGING_COOKIE)?.value;
        if (linkingUserId) {
          cookieStore.set(LINKING_COOKIE, '', { maxAge: 0, path: '/' });
        }
        if (mergingUserId) {
          cookieStore.set(MERGING_COOKIE, '', { maxAge: 0, path: '/' });
        }
      } catch {
        // signIn 콜백에서 쿠키 접근 실패 시 무시 (로그인 흐름)
      }

      // 1. 기존 Account 연결이 있는지 확인
      const existingAccount = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });

      // 병합 모드: 이 소셜 계정이 다른 User에 속해있으면 병합 실행
      if (mergingUserId) {
        const mergeTarget = await prisma.user.findUnique({ where: { id: mergingUserId } });
        if (!mergeTarget) {
          return `/account?error=invalid_merging_user`;
        }

        if (existingAccount) {
          if (existingAccount.userId === mergingUserId) {
            // 이미 같은 User → 아무것도 안함
            return true;
          }
          // 다른 User(B)의 Account들을 현재 User(A)로 이관 + User B 삭제
          await prisma.$transaction([
            prisma.account.updateMany({
              where: { userId: existingAccount.userId },
              data: { userId: mergingUserId },
            }),
            prisma.user.delete({ where: { id: existingAccount.userId } }),
          ]);
          return true;
        }

        // 기존 Account 없으면 현재 User에 새 Account만 추가
        await prisma.account.create({
          data: { userId: mergingUserId, provider, providerAccountId },
        });
        if (!mergeTarget.name && socialUser.name) {
          await prisma.user.update({
            where: { id: mergingUserId },
            data: { name: socialUser.name },
          });
        }
        return true;
      }

      if (existingAccount) {
        // 연동 모드인데 다른 User에 이미 연결되어 있으면 거부
        if (linkingUserId && existingAccount.userId !== linkingUserId) {
          return `/account?error=already_linked_to_other`;
        }
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

      // 연동 모드: 현재 로그인된 User에 새 Account만 추가
      if (linkingUserId) {
        const targetUser = await prisma.user.findUnique({ where: { id: linkingUserId } });
        if (!targetUser) {
          return `/account?error=invalid_linking_user`;
        }
        await prisma.account.create({
          data: { userId: linkingUserId, provider, providerAccountId },
        });
        if (!targetUser.name && socialUser.name) {
          await prisma.user.update({
            where: { id: linkingUserId },
            data: { name: socialUser.name },
          });
        }
        return true;
      }

      // 2. 같은 이메일을 가진 User가 있는지 확인 (계정 자동 연동)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        await prisma.account.create({
          data: { userId: existingUser.id, provider, providerAccountId },
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
    async jwt({ token, account }) {
      // 최초 로그인 시 provider/providerAccountId로 내부 User 조회 후 토큰에 저장
      if (account) {
        const dbAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          include: { user: true },
        });
        if (dbAccount) {
          token.userId = dbAccount.user.id;
          token.email = dbAccount.user.email;
          token.name = dbAccount.user.name;
          token.picture = dbAccount.user.profileImage;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        (session.user as { id?: string }).id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = (token.name as string) ?? null;
        session.user.image = (token.picture as string) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

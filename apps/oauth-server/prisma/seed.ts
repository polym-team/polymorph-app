import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

/**
 * 등록할 클라이언트 앱 목록
 */
const CLIENT_APPS = [
  {
    clientId: 'jibsayo',
    name: '집사요',
    allowedRedirectUris: [
      'http://localhost:3000/auth/callback',
      'https://jibsayo.polymorph.co.kr/auth/callback',
    ].join(','),
    accessTokenLifetime: 60 * 60 * 24 * 7, // 7일
  },
  {
    clientId: 'autto',
    name: 'Autto',
    allowedRedirectUris: [
      'http://localhost:3006/auth/callback',
      'https://autto.polymorph.co.kr/auth/callback',
    ].join(','),
    accessTokenLifetime: 60 * 60 * 24 * 7,
  },
  {
    clientId: 'direct-feedback',
    name: 'DirectFeedback',
    // 확장 redirect URI 는 chrome.identity.getRedirectURL() = https://<EXT_ID>.chromiumapp.org/
    // EXT_ID 는 unpacked 로드 후 chrome://extensions 에서 확인 → 아래 env 로 주입하고 재-seed.
    //   DIRECT_FEEDBACK_EXT_ID=<id> pnpm --filter oauth-server db:seed
    allowedRedirectUris: [
      'http://localhost:3008/auth/callback', // 대시보드 웹 로그인용
      ...(process.env.DIRECT_FEEDBACK_EXT_ID
        ? [`https://${process.env.DIRECT_FEEDBACK_EXT_ID}.chromiumapp.org/`]
        : []),
    ].join(','),
    accessTokenLifetime: 60 * 60 * 24 * 7,
  },
  {
    clientId: 'test',
    name: '테스트 클라이언트',
    allowedRedirectUris: [
      'http://localhost:3007/test/callback',
      'https://oauth.polymorph.co.kr/test/callback',
    ].join(','),
    accessTokenLifetime: 60 * 60,
  },
];

async function main() {
  for (const app of CLIENT_APPS) {
    await prisma.clientApp.upsert({
      where: { clientId: app.clientId },
      update: {
        name: app.name,
        allowedRedirectUris: app.allowedRedirectUris,
        accessTokenLifetime: app.accessTokenLifetime,
        enabled: true,
      },
      create: app,
    });
    console.log(`✔ ${app.clientId} (${app.name}) 등록`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

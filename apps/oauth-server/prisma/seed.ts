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
    // 확장 redirect URI = chrome.identity.getRedirectURL() = https://<EXT_ID>.chromiumapp.org/
    // 로컬 unpacked 개발본과 웹스토어 배포본은 ID 가 달라 둘 다 등록한다.
    // 추가 ID 는 DIRECT_FEEDBACK_EXT_ID(들, 콤마구분) env 로도 주입 가능.
    allowedRedirectUris: [
      'http://localhost:3008/auth/callback', // 대시보드 웹 로그인용 (로컬)
      'https://directfeedback.polymorph.co.kr/auth/callback', // 대시보드 웹 로그인용 (프로덕션)
      'http://127.0.0.1/callback', // MCP 루프백 (RFC 8252, 포트 무시 매칭)
      ...[
        'oaoboabibkdlppgglbccllmognkkpinn', // 로컬 unpacked 개발
        'eooipclemnmfgcmkpcedkejelmnjlpkb', // Chrome 웹스토어 배포
        ...(process.env.DIRECT_FEEDBACK_EXT_ID
          ? process.env.DIRECT_FEEDBACK_EXT_ID.split(',').map((s) => s.trim()).filter(Boolean)
          : []),
      ].map((id) => `https://${id}.chromiumapp.org/`),
    ].join(','),
    accessTokenLifetime: 60 * 60 * 24 * 7,
  },
  {
    clientId: 'myflighthistory',
    name: 'MyFlightHistory',
    allowedRedirectUris: [
      'http://localhost:3009/auth/callback',
      'https://myflighthistory.polymorph.co.kr/auth/callback',
    ].join(','),
    accessTokenLifetime: 60 * 60 * 24 * 7,
  },
  {
    clientId: 'tallo',
    name: 'Tallo',
    allowedRedirectUris: [
      'http://localhost:3010/auth/callback', // 웹 서비스 페이지(로컬)
      'https://tallo.polymorph.co.kr/auth/callback', // 웹 서비스 페이지(프로덕션)
      'tallobridge://auth/callback', // RN 브릿지 앱(dev build/standalone 커스텀 스킴)
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

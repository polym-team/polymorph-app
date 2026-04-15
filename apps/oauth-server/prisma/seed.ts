import { PrismaClient } from '@prisma/client';

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

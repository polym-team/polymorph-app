import 'dotenv/config';

import { loginAndGetSession } from './auth/amoremall.js';
import { fetchAllProducts as fetchAmoremall } from './fetchers/amoremall.js';
import { fetchAllProducts as fetchInnisfree } from './fetchers/innisfree.js';
import { generateProductHtml } from './html.js';
import { uploadHtml } from './minio.js';
import { sendNotification } from './slack.js';

const PAGE_URL = 'https://minio.polymorph.co.kr/share-discount-products/amorepacific/index.html';

async function slackOnly() {
  const slackWebhookUrl = process.env.AMOREMALL_PRODUCT_INFO_SLACK_WEBHOOK;
  if (!slackWebhookUrl) {
    throw new Error('AMOREMALL_PRODUCT_INFO_SLACK_WEBHOOK 환경변수가 필요합니다.');
  }

  console.log('1. 슬랙 알림 전송...');
  await sendNotification(slackWebhookUrl, PAGE_URL);
  console.log('완료!');
}

async function refresh() {
  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;

  if (!id || !pw) {
    throw new Error('AMOREMALL_ID, AMOREMALL_PW 환경변수가 필요합니다.');
  }

  // === 로그인 ===
  console.log('1. 아모레몰 로그인...');
  const session = await loginAndGetSession(id, pw);
  console.log('   로그인 성공');

  try {
    // === 아모레몰 ===
    console.log('2. 아모레몰 상품 조회...');
    const amoremallAll = await fetchAmoremall(session.token);
    console.log(`   총 ${amoremallAll.length}개 상품 조회됨`);

    // === 이니스프리 ===
    console.log('3. 이니스프리 상품 조회...');
    const innisfreeAll = await fetchInnisfree(session.context);
    console.log(`   총 ${innisfreeAll.length}개 상품 조회됨`);

    // === HTML 생성 ===
    console.log('4. HTML 페이지 생성...');
    const html = generateProductHtml(amoremallAll, innisfreeAll);

    // === MinIO 업로드 ===
    const key = 'amorepacific/index.html';

    console.log(`5. MinIO 업로드 (${key})...`);
    const pageUrl = await uploadHtml(html, key);
    console.log(`   업로드 완료: ${pageUrl}`);

    console.log('완료!');
  } finally {
    await session.browser.close();
  }
}

async function main() {
  const mode = process.argv[2];

  if (mode === '--slack-only') {
    await slackOnly();
  } else {
    await refresh();
  }
}

main().catch((err) => {
  console.error('실행 실패:', err);
  process.exit(1);
});

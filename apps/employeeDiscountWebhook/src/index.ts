import 'dotenv/config';

import { loginAndGetSession } from './auth/amoremall.js';
import { fetchAllProducts as fetchAmoremall, filterProducts as filterAmoremall } from './fetchers/amoremall.js';
import { fetchAllProducts as fetchInnisfree } from './fetchers/innisfree.js';
import { generateProductHtml } from './html.js';
import { uploadHtml } from './minio.js';
import { sendNotification } from './slack.js';

async function main() {
  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;
  const slackWebhookUrl = process.env.AMOREMALL_PRODUCT_INFO_SLACK_WEBHOOK;
  const isCI = !!process.env.CI;

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

    console.log('3. 아모레몰 상품 필터링...');
    const amoremallFiltered = filterAmoremall(amoremallAll);
    console.log(`   ${amoremallFiltered.length}개 상품 매칭`);

    // === 이니스프리 ===
    console.log('4. 이니스프리 상품 조회...');
    const innisfreeAll = await fetchInnisfree(session.context);
    console.log(`   총 ${innisfreeAll.length}개 상품 조회됨`);

    // === HTML 생성 ===
    console.log('5. HTML 페이지 생성...');
    const html = generateProductHtml(amoremallFiltered, innisfreeAll);

    // === MinIO 업로드 ===
    const today = new Date()
      .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' })
      .replace(/\. /g, '-')
      .replace('.', '');
    const key = `${today}.html`;

    console.log(`6. MinIO 업로드 (${key})...`);
    const pageUrl = await uploadHtml(html, key);
    console.log(`   업로드 완료: ${pageUrl}`);

    // === 슬랙 전송 ===
    if (isCI && slackWebhookUrl) {
      console.log('7. 슬랙 알림 전송...');
      await sendNotification(slackWebhookUrl, pageUrl, amoremallFiltered.length, innisfreeAll.length);
    } else {
      console.log('7. [로컬] 슬랙 미전송');
      console.log(`   페이지 URL: ${pageUrl}`);
    }

    console.log('완료!');
  } finally {
    await session.browser.close();
  }
}

main().catch((err) => {
  console.error('실행 실패:', err);
  process.exit(1);
});

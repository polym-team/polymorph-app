import 'dotenv/config';

import { loginAndGetSession } from './auth/amoremall.js';
import { fetchAllProducts as fetchAmoremall, filterProducts as filterAmoremall } from './fetchers/amoremall.js';
import { fetchAllProducts as fetchInnisfree } from './fetchers/innisfree.js';
import { sendAmoremallNotification, sendInnisfreeNotification } from './slack.js';

async function main() {
  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;
  const slackWebhookUrl = process.env.AMOREMALL_PRODUCT_INFO_SLACK_WEBHOOK;

  const isCI = !!process.env.CI;

  if (!id || !pw) {
    throw new Error('AMOREMALL_ID, AMOREMALL_PW 환경변수가 필요합니다.');
  }
  if (isCI && !slackWebhookUrl) {
    throw new Error('AMOREMALL_PRODUCT_INFO_SLACK_WEBHOOK 환경변수가 필요합니다.');
  }

  // === 로그인 (브라우저 세션 유지) ===
  console.log('1. 아모레몰 로그인...');
  const session = await loginAndGetSession(id, pw);
  console.log('   로그인 성공');

  try {
    // === 아모레몰 ===
    console.log('2. 아모레몰 상품 목록 조회...');
    const amoremallAll = await fetchAmoremall(session.token);
    console.log(`   총 ${amoremallAll.length}개 상품 조회됨`);

    console.log('3. 아모레몰 상품 필터링...');
    const amoremallFiltered = filterAmoremall(amoremallAll);
    console.log(`   ${amoremallFiltered.length}개 상품 매칭`);

    // === 이니스프리 (같은 브라우저 세션 재활용) ===
    console.log('4. 이니스프리 상품 조회...');
    const innisfreeAll = await fetchInnisfree(session.page);
    console.log(`   총 ${innisfreeAll.length}개 상품 조회됨`);

    // === 슬랙 전송 or 콘솔 출력 ===
    if (isCI && slackWebhookUrl) {
      console.log('5. 슬랙 알림 전송...');
      await sendAmoremallNotification(slackWebhookUrl, amoremallFiltered);
      await sendInnisfreeNotification(slackWebhookUrl, innisfreeAll);
    } else {
      console.log('5. [로컬] 슬랙 미전송 — 결과 요약:');
      console.log(`   아모레몰: ${amoremallFiltered.length}개 상품`);
      for (const p of amoremallFiltered) {
        console.log(`     - ${p.brandName} | ${p.goodsName} | ${p.salePrice.toLocaleString()}원`);
      }
      console.log(`   이니스프리: ${innisfreeAll.length}개 상품`);
      for (const p of innisfreeAll) {
        console.log(`     - ${p.name} | ${p.employeePrice.toLocaleString()}원`);
      }
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

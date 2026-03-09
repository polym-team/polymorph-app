import 'dotenv/config';

import { getAmoremallToken } from './auth/amoremall.js';
import { fetchAllProducts as fetchAmoremall, filterProducts as filterAmoremall } from './fetchers/amoremall.js';
import { fetchAllProducts as fetchInnisfree } from './fetchers/innisfree.js';
import { sendAmoremallNotification, sendInnisfreeNotification } from './slack.js';

async function main() {
  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;
  const slackWebhookUrl = process.env.AMOREMALL_PRODUCT_INFO_SLACK_WEBHOOK;

  if (!id || !pw) {
    throw new Error('AMOREMALL_ID, AMOREMALL_PW 환경변수가 필요합니다.');
  }
  if (!slackWebhookUrl) {
    throw new Error('AMOREMALL_PRODUCT_INFO_SLACK_WEBHOOK 환경변수가 필요합니다.');
  }

  // === 아모레몰 ===
  console.log('1. 아모레몰 로그인...');
  const token = await getAmoremallToken(id, pw);
  console.log('   로그인 성공');

  console.log('2. 아모레몰 상품 목록 조회...');
  const amoremallAll = await fetchAmoremall(token);
  console.log(`   총 ${amoremallAll.length}개 상품 조회됨`);

  console.log('3. 아모레몰 상품 필터링...');
  const amoremallFiltered = filterAmoremall(amoremallAll);
  console.log(`   ${amoremallFiltered.length}개 상품 매칭`);

  // === 이니스프리 ===
  console.log('4. 이니스프리 상품 조회 (아모레몰 토큰 사용)...');
  const innisfreeAll = await fetchInnisfree(token);
  console.log(`   총 ${innisfreeAll.length}개 상품 조회됨`);

  // === 슬랙 전송 ===
  console.log('5. 슬랙 알림 전송...');
  await sendAmoremallNotification(slackWebhookUrl, amoremallFiltered);
  await sendInnisfreeNotification(slackWebhookUrl, innisfreeAll);

  console.log('완료!');
}

main().catch((err) => {
  console.error('실행 실패:', err);
  process.exit(1);
});

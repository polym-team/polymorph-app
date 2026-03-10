export async function sendNotification(
  webhookUrl: string,
  pageUrl: string,
  amoremallCount: number,
  innisfreeCount: number,
): Promise<void> {
  const now = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `임직원 할인 상품 알림 (${now})` },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `아모레몰 *${amoremallCount}개* | 이니스프리 *${innisfreeCount}개*\n\n<${pageUrl}|상품 목록 보기>`,
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`슬랙 전송 실패 (${res.status}): ${text}`);
  }

  console.log('  [슬랙] 알림 전송 완료');
}

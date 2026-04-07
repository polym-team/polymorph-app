const SITE_URL = 'https://rootbeer-employee-mall.polymorph.co.kr';
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

async function postMessage(params: {
  text: string;
  blocks?: unknown[];
  thread_ts?: string;
}): Promise<string | null> {
  if (!BOT_TOKEN || !CHANNEL_ID) return null;

  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: CHANNEL_ID,
        text: params.text,
        blocks: params.blocks,
        thread_ts: params.thread_ts,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[slack] 전송 실패:', data.error);
      return null;
    }
    return data.ts ?? null;
  } catch (err) {
    console.error('[slack] 요청 실패:', err);
    return null;
  }
}

export async function notifyRoundOpened(
  title: string | null,
  deadline: Date | null,
): Promise<string | null> {
  const now = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });

  const deadlineText = deadline
    ? `\n:alarm_clock: 마감: ${deadline.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`
    : '';

  return postMessage({
    text: `임직원 할인 주문 접수 (${now})`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `임직원 할인 주문 접수 (${now})` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${title ? `*${title}*\n` : ''}주문이 열렸습니다! 아래 링크에서 상품을 확인하고 주문해주세요.${deadlineText}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '임직원몰 바로가기' },
            url: SITE_URL,
            style: 'primary',
          },
        ],
      },
    ],
  });
}

export async function notifyProductsUpdated(
  amoremallCount: number,
  innisfreeCount: number,
) {
  const now = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });

  await postMessage({
    text: `임직원 할인 상품 알림 (${now})`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `임직원 할인 상품 알림 (${now})` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `상품이 업데이트되었습니다.\n:shopping_bags: 아모레몰 *${amoremallCount}*개 · 이니스프리 *${innisfreeCount}*개`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '상품 목록 보기' },
            url: SITE_URL,
            style: 'primary',
          },
        ],
      },
    ],
  });
}

export async function notifyNewNotices(
  notices: { id: number; title: string }[],
) {
  const now = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });

  const noticeList = notices
    .map((n) => `• <https://www.amoremall.com/kr/ko/cs/noticeView/${n.id}|${n.title}>`)
    .join('\n');

  await postMessage({
    text: `임직원 공지사항 업데이트 (${now})`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `임직원 공지사항 업데이트 (${now})` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:mega: 새로운 임직원 공지사항 *${notices.length}건*이 등록되었습니다.\n\n${noticeList}`,
        },
      },
    ],
  });
}

export async function notifyRoundClosed(
  slackTs: string,
  title: string | null,
  orderCount: number,
) {
  await postMessage({
    text: '주문이 마감되었습니다.',
    thread_ts: slackTs,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${title ? `*${title}* ` : ''}주문이 마감되었습니다.\n총 *${orderCount}건*의 주문이 접수되었습니다.`,
        },
      },
    ],
  });
}

import type { AmoremallProduct } from './fetchers/amoremall.js';
import type { InnisfreeProduct } from './fetchers/innisfree.js';

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  image_url?: string;
  alt_text?: string;
  elements?: { type: string; text: string }[];
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

function getNowStr(): string {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

// === 아모레몰 ===

function buildAmoremallBlocks(products: AmoremallProduct[]): SlackBlock[] {
  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🛍️ 아모레몰 임직원 상품 알림 (${getNowStr()})` },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `브랜드: *설화수, 헤라, 프리메라* | 키워드: *기획, 세트*\n매칭 상품: *${products.length}개*`,
      },
    },
    { type: 'divider' } as SlackBlock,
  ];

  for (const p of products) {
    const discountText = p.discountRate > 0 ? ` (${p.discountRate}% OFF)` : '';
    const soldOutText = p.soldOut ? ' ❌품절' : '';
    const priceText =
      p.originPrice > p.salePrice
        ? `~${formatPrice(p.originPrice)}~ → *${formatPrice(p.salePrice)}*${discountText}`
        : `*${formatPrice(p.salePrice)}*`;

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${p.goodsName}*${soldOutText}\n${p.brandName} | ${priceText}`,
      },
    });

    if (p.imageUrl) {
      blocks.push({
        type: 'image',
        image_url: p.imageUrl,
        alt_text: p.goodsName,
      });
    }
  }

  if (products.length === 0) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: '매칭되는 상품이 없습니다.' },
    });
  }

  return blocks;
}

// === 이니스프리 ===

function buildInnisfreeBlocks(products: InnisfreeProduct[]): SlackBlock[] {
  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🌿 이니스프리 임직원 상품 알림 (${getNowStr()})` },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `전체 임직원 전용 상품: *${products.length}개*`,
      },
    },
    { type: 'divider' } as SlackBlock,
  ];

  for (const p of products) {
    const discountText = p.employeeRate > 0 ? ` (${p.employeeRate}% OFF)` : '';
    const soldOutText = p.soldOut ? ' ❌품절' : '';
    const priceText =
      p.listPrice > p.employeePrice
        ? `~${formatPrice(p.listPrice)}~ → *${formatPrice(p.employeePrice)}*${discountText}`
        : `*${formatPrice(p.employeePrice)}*`;

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${p.name}*${soldOutText}\n이니스프리 | ${priceText}`,
      },
    });

    if (p.imageUrl) {
      blocks.push({
        type: 'image',
        image_url: p.imageUrl,
        alt_text: p.name,
      });
    }
  }

  if (products.length === 0) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: '매칭되는 상품이 없습니다.' },
    });
  }

  return blocks;
}

// === 전송 ===

const SLACK_BLOCK_LIMIT = 46;

export async function sendAmoremallNotification(
  webhookUrl: string,
  products: AmoremallProduct[],
): Promise<void> {
  const blocks = buildAmoremallBlocks(products);
  await sendChunked(webhookUrl, blocks, '아모레몰');
}

export async function sendInnisfreeNotification(
  webhookUrl: string,
  products: InnisfreeProduct[],
): Promise<void> {
  const blocks = buildInnisfreeBlocks(products);
  await sendChunked(webhookUrl, blocks, '이니스프리');
}

async function sendChunked(webhookUrl: string, allBlocks: SlackBlock[], label: string) {
  const headerBlocks = allBlocks.slice(0, 3);
  const productBlocks = allBlocks.slice(3);

  const chunks: SlackBlock[][] = [];
  for (let i = 0; i < productBlocks.length; i += SLACK_BLOCK_LIMIT) {
    chunks.push(productBlocks.slice(i, i + SLACK_BLOCK_LIMIT));
  }

  const firstBlocks = [...headerBlocks, ...(chunks[0] ?? [])];
  await postToSlack(webhookUrl, firstBlocks);

  for (let i = 1; i < chunks.length; i++) {
    await postToSlack(webhookUrl, chunks[i]);
  }

  console.log(`[${label}] 슬랙 알림 전송 완료 (${chunks.length}개 메시지)`);
}

async function postToSlack(webhookUrl: string, blocks: SlackBlock[]): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`슬랙 전송 실패 (${res.status}): ${text}`);
  }
}

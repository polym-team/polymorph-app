import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronKey } from '@/lib/cron-auth';
import { loginAndGetSession } from '@/lib/scraper/amoremall-auth';
import { scrapeProductDetails } from '@/lib/scraper/scrape-product-details';

export const maxDuration = 300;

export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const products = await prisma.product.findMany({
    where: {
      soldOut: false,
      removed: false,
      OR: [
        // 상세 정보가 아직 없는 상품
        {
          detail: null,
          OR: [
            { store: 'amoremall', productUrl: { not: null } },
            { store: 'innisfree' },
          ],
        },
        // 상세 정보가 일주일 이상 지난 상품
        {
          detail: { scrapedAt: { lt: oneWeekAgo } },
          OR: [
            { store: 'amoremall', productUrl: { not: null } },
            { store: 'innisfree' },
          ],
        },
      ],
    },
    take: 5,
    orderBy: [{ detail: { scrapedAt: 'asc' } }, { id: 'asc' }],
  });

  if (products.length === 0) {
    return NextResponse.json({ message: 'no products to process', processed: 0 });
  }

  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;
  if (!id || !pw) {
    return NextResponse.json({ error: 'credentials missing' }, { status: 500 });
  }

  const session = await loginAndGetSession(id, pw);

  try {
    const results = await scrapeProductDetails(products, session.context, session.page);
    const success = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`[cron/product-detail] 처리: ${success} 성공, ${failed} 실패`);
    return NextResponse.json({ processed: products.length, success, failed });
  } finally {
    await session.browser.close();
  }
}

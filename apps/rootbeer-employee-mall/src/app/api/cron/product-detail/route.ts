import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronKey } from '@/lib/cron-auth';
import { loginAndGetSession } from '@/lib/scraper/amoremall-auth';
import { scrapeProductDetail } from '@/lib/scraper/product-detail';

export const maxDuration = 300;

export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  const products = await prisma.product.findMany({
    where: {
      store: 'amoremall',
      productUrl: { not: null },
      soldOut: false,
      detail: null,
    },
    take: 3,
    orderBy: { id: 'asc' },
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
  let success = 0;
  let failed = 0;

  try {
    for (const product of products) {
      try {
        const detail = await scrapeProductDetail(session.page, product.productUrl!);
        await prisma.productDetail.upsert({
          where: { productId: product.id },
          update: {
            description: detail.description,
            images: JSON.stringify(detail.images),
            htmlContent: detail.detailHtml,
            scrapedAt: new Date(),
          },
          create: {
            productId: product.id,
            description: detail.description,
            images: JSON.stringify(detail.images),
            htmlContent: detail.detailHtml,
          },
        });
        success++;
      } catch (err) {
        console.error(`[cron/product-detail] #${product.id} 실패:`, err);
        failed++;
      }
    }
  } finally {
    await session.browser.close();
  }

  console.log(`[cron/product-detail] 처리: ${success} 성공, ${failed} 실패`);
  return NextResponse.json({ processed: products.length, success, failed });
}

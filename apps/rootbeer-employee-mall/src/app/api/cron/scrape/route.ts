import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronKey } from '@/lib/cron-auth';
import { loginAndGetSession } from '@/lib/scraper/amoremall-auth';
import { fetchAllProducts as fetchAmoremall, filterProducts } from '@/lib/scraper/amoremall';
import { fetchAllProducts as fetchInnisfree } from '@/lib/scraper/innisfree';

export const maxDuration = 120;

export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;
  if (!id || !pw) {
    return NextResponse.json({ error: 'credentials missing' }, { status: 500 });
  }

  const session = await loginAndGetSession(id, pw);

  try {
    const amoremallAll = await fetchAmoremall(session.token);
    const amoremallFiltered = filterProducts(amoremallAll);
    const innisfreeAll = await fetchInnisfree(session.context);

    // Upsert amoremall products
    const amoremallIds = new Set<string>();
    for (const p of amoremallFiltered) {
      amoremallIds.add(String(p.goodsNo));
      await prisma.product.upsert({
        where: { store_externalId: { store: 'amoremall', externalId: String(p.goodsNo) } },
        update: {
          name: p.goodsName, brand: p.brandName, salePrice: p.salePrice,
          originPrice: p.originPrice, discountRate: p.discountRate,
          imageUrl: p.imageUrl, productUrl: p.productUrl,
          soldOut: p.soldOut, removed: false, scrapedAt: new Date(),
        },
        create: {
          store: 'amoremall', externalId: String(p.goodsNo),
          name: p.goodsName, brand: p.brandName, salePrice: p.salePrice,
          originPrice: p.originPrice, discountRate: p.discountRate,
          imageUrl: p.imageUrl, productUrl: p.productUrl, soldOut: p.soldOut,
        },
      });
    }

    // 아모레몰에서 사라진 상품 removed 처리
    await prisma.product.updateMany({
      where: {
        store: 'amoremall',
        removed: false,
        externalId: { notIn: Array.from(amoremallIds) },
      },
      data: { removed: true },
    });

    // Upsert innisfree products
    const innisfreeIds = new Set<string>();
    for (const p of innisfreeAll) {
      innisfreeIds.add(p.productId);
      await prisma.product.upsert({
        where: { store_externalId: { store: 'innisfree', externalId: p.productId } },
        update: {
          name: p.name, salePrice: p.employeePrice, originPrice: p.listPrice,
          discountRate: p.employeeRate, imageUrl: p.imageUrl,
          productUrl: p.productUrl, soldOut: p.soldOut, removed: false, scrapedAt: new Date(),
        },
        create: {
          store: 'innisfree', externalId: p.productId, name: p.name,
          brand: '이니스프리', salePrice: p.employeePrice, originPrice: p.listPrice,
          discountRate: p.employeeRate, imageUrl: p.imageUrl,
          productUrl: p.productUrl, soldOut: p.soldOut,
        },
      });
    }

    // 이니스프리에서 사라진 상품 removed 처리
    await prisma.product.updateMany({
      where: {
        store: 'innisfree',
        removed: false,
        externalId: { notIn: Array.from(innisfreeIds) },
      },
      data: { removed: true },
    });

    console.log(`[cron/scrape] 아모레몰: ${amoremallFiltered.length}, 이니스프리: ${innisfreeAll.length}`);
    return NextResponse.json({ amoremall: amoremallFiltered.length, innisfree: innisfreeAll.length });
  } finally {
    await session.browser.close();
  }
}

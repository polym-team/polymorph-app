import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-utils';
import { loginAndGetSession } from '@/lib/scraper/amoremall-auth';
import { fetchAllProducts as fetchAmoremall, filterProducts } from '@/lib/scraper/amoremall';
import { fetchAllProducts as fetchInnisfree } from '@/lib/scraper/innisfree';

export const maxDuration = 120;

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;

  if (!id || !pw) {
    return NextResponse.json(
      { error: 'AMOREMALL_ID, AMOREMALL_PW 환경변수가 필요합니다' },
      { status: 500 },
    );
  }

  const session = await loginAndGetSession(id, pw);

  try {
    const amoremallAll = await fetchAmoremall(session.token);
    const amoremallFiltered = filterProducts(amoremallAll);
    const innisfreeAll = await fetchInnisfree(session.context);

    // Upsert amoremall products
    for (const p of amoremallFiltered) {
      await prisma.product.upsert({
        where: {
          store_externalId: { store: 'amoremall', externalId: String(p.goodsNo) },
        },
        update: {
          name: p.goodsName,
          brand: p.brandName,
          salePrice: p.salePrice,
          originPrice: p.originPrice,
          discountRate: p.discountRate,
          imageUrl: p.imageUrl,
          productUrl: p.productUrl,
          soldOut: p.soldOut,
          scrapedAt: new Date(),
        },
        create: {
          store: 'amoremall',
          externalId: String(p.goodsNo),
          name: p.goodsName,
          brand: p.brandName,
          salePrice: p.salePrice,
          originPrice: p.originPrice,
          discountRate: p.discountRate,
          imageUrl: p.imageUrl,
          productUrl: p.productUrl,
          soldOut: p.soldOut,
        },
      });
    }

    // Upsert innisfree products
    for (const p of innisfreeAll) {
      await prisma.product.upsert({
        where: {
          store_externalId: { store: 'innisfree', externalId: p.productId },
        },
        update: {
          name: p.name,
          salePrice: p.employeePrice,
          originPrice: p.listPrice,
          discountRate: p.employeeRate,
          imageUrl: p.imageUrl,
          productUrl: p.productUrl,
          soldOut: p.soldOut,
          scrapedAt: new Date(),
        },
        create: {
          store: 'innisfree',
          externalId: p.productId,
          name: p.name,
          brand: '이니스프리',
          salePrice: p.employeePrice,
          originPrice: p.listPrice,
          discountRate: p.employeeRate,
          imageUrl: p.imageUrl,
          productUrl: p.productUrl,
          soldOut: p.soldOut,
        },
      });
    }

    return NextResponse.json({
      amoremall: amoremallFiltered.length,
      innisfree: innisfreeAll.length,
    });
  } finally {
    await session.browser.close();
  }
}

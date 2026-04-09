import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-utils';
import { loginAndGetSession } from '@/lib/scraper/amoremall-auth';
import { scrapeProductDetail } from '@/lib/scraper/product-detail';
import { fetchInnisfreeProductDetail, type InnisfreeProductOption } from '@/lib/scraper/innisfree';

async function saveOptions(productId: number, options: InnisfreeProductOption[]) {
  for (const opt of options) {
    await prisma.productOption.upsert({
      where: { productId_externalId: { productId, externalId: opt.externalId } },
      update: { name: opt.name, stock: opt.stock, soldOut: opt.stock <= 0, sortOrder: opt.sortOrder, scrapedAt: new Date() },
      create: { productId, externalId: opt.externalId, name: opt.name, stock: opt.stock, soldOut: opt.stock <= 0, sortOrder: opt.sortOrder },
    });
  }
}

export const maxDuration = 300;

// GET: 단일 상품 상세 스크래핑 (테스트용)
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId 필요' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product?.productUrl) {
    return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
  }

  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;
  if (!id || !pw) {
    return NextResponse.json({ error: '자격증명 필요' }, { status: 500 });
  }

  const session = await loginAndGetSession(id, pw);
  try {
    if (product.store === 'innisfree') {
      const detail = await fetchInnisfreeProductDetail(session.context, product.externalId);
      await prisma.productDetail.upsert({
        where: { productId: product.id },
        update: {
          description: detail.description,
          images: JSON.stringify(detail.images),
          rawJson: detail.rawJson,
          scrapedAt: new Date(),
        },
        create: {
          productId: product.id,
          description: detail.description,
          images: JSON.stringify(detail.images),
          rawJson: detail.rawJson,
        },
      });
      if (detail.options.length > 0) {
        await saveOptions(product.id, detail.options);
      }
      return NextResponse.json({ productId: product.id, ...detail, saved: true });
    }

    const detail = await scrapeProductDetail(session.page, product.productUrl);
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

    return NextResponse.json({ productId: product.id, ...detail, saved: true });
  } finally {
    await session.browser.close();
  }
}

// POST: 배치 스크래핑 (상세가 없는 상품들 순차 처리)
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const limit = (body as { limit?: number }).limit ?? 5;

  // 상세가 없는 상품 조회 (아모레몰 + 이니스프리)
  const products = await prisma.product.findMany({
    where: {
      soldOut: false,
      detail: null,
      OR: [
        { store: 'amoremall', productUrl: { not: null } },
        { store: 'innisfree' },
      ],
    },
    take: limit,
    orderBy: { id: 'asc' },
  });

  if (products.length === 0) {
    return NextResponse.json({ message: '처리할 상품이 없습니다', processed: 0, success: 0, failed: 0, results: [] });
  }

  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;
  if (!id || !pw) {
    return NextResponse.json({ error: '자격증명 필요' }, { status: 500 });
  }

  const session = await loginAndGetSession(id, pw);
  const results: { productId: number; name: string; success: boolean; error?: string }[] = [];

  try {
    for (const product of products) {
      try {
        if (product.store === 'innisfree') {
          const detail = await fetchInnisfreeProductDetail(session.context, product.externalId);
          await prisma.productDetail.upsert({
            where: { productId: product.id },
            update: {
              description: detail.description,
              images: JSON.stringify(detail.images),
              rawJson: detail.rawJson,
              scrapedAt: new Date(),
            },
            create: {
              productId: product.id,
              description: detail.description,
              images: JSON.stringify(detail.images),
              rawJson: detail.rawJson,
            },
          });
          if (detail.options.length > 0) {
            await saveOptions(product.id, detail.options);
          }
        } else {
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
        }
        results.push({ productId: product.id, name: product.name, success: true });
      } catch (err) {
        results.push({
          productId: product.id,
          name: product.name,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } finally {
    await session.browser.close();
  }

  return NextResponse.json({
    processed: results.length,
    success: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  });
}

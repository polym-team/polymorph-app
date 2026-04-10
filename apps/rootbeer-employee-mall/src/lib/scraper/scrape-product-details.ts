import type { Product } from '@prisma/client';
import type { BrowserContext, Page } from 'playwright';
import { prisma } from '@/lib/prisma';
import { scrapeProductDetail, type ProductOption } from './product-detail';
import { fetchInnisfreeProductDetail, type InnisfreeProductOption } from './innisfree';

export interface ScrapeResult {
  productId: number;
  name: string;
  success: boolean;
  error?: string;
}

async function saveInnisfreeOptions(productId: number, options: InnisfreeProductOption[]) {
  for (const opt of options) {
    await prisma.productOption.upsert({
      where: { productId_externalId: { productId, externalId: opt.externalId } },
      update: { name: opt.name, stock: opt.stock, soldOut: opt.stock <= 0, sortOrder: opt.sortOrder, scrapedAt: new Date() },
      create: { productId, externalId: opt.externalId, name: opt.name, stock: opt.stock, soldOut: opt.stock <= 0, sortOrder: opt.sortOrder },
    });
  }
}

async function saveAmoremallOptions(productId: number, options: ProductOption[]) {
  for (const opt of options) {
    await prisma.productOption.upsert({
      where: { productId_externalId: { productId, externalId: opt.externalId } },
      update: { name: opt.name, salePrice: opt.price, discountRate: opt.discountRate, sortOrder: opt.sortOrder, scrapedAt: new Date() },
      create: { productId, externalId: opt.externalId, name: opt.name, salePrice: opt.price, discountRate: opt.discountRate, sortOrder: opt.sortOrder },
    });
  }
}

async function scrapeOneProduct(product: Product, context: BrowserContext, page: Page) {
  if (product.store === 'innisfree') {
    const detail = await fetchInnisfreeProductDetail(context, product.externalId);
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
      await saveInnisfreeOptions(product.id, detail.options);
    }
  } else {
    const detail = await scrapeProductDetail(page, product.productUrl!);
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
    if (detail.options.length > 0) {
      await saveAmoremallOptions(product.id, detail.options);
    }
  }
}

export async function scrapeProductDetails(
  products: Product[],
  context: BrowserContext,
  page: Page,
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  for (const product of products) {
    try {
      await scrapeOneProduct(product, context, page);
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

  return results;
}

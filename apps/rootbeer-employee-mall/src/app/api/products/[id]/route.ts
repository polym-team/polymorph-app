import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-utils';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      detail: true,
      options: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    detail: product.detail
      ? {
          description: product.detail.description,
          images: product.detail.images ? JSON.parse(product.detail.images) : [],
          htmlContent: product.detail.htmlContent,
          scrapedAt: product.detail.scrapedAt,
        }
      : null,
    options: product.options.map((o) => ({
      id: o.id,
      name: o.name,
      stock: o.stock,
      soldOut: o.soldOut,
    })),
  });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-utils';
import type { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const store = searchParams.get('store');
  const brand = searchParams.get('brand');
  const keyword = searchParams.get('keyword');

  const where: Prisma.ProductWhereInput = { removed: false };

  if (store) where.store = store as 'amoremall' | 'innisfree';
  if (brand) where.brand = brand;
  if (keyword) where.name = { contains: keyword };

  const products = await prisma.product.findMany({
    where,
    include: { detail: { select: { id: true } } },
    orderBy: [{ soldOut: 'asc' }, { brand: 'asc' }, { name: 'asc' }],
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      hasDetail: !!p.detail,
      detail: undefined,
    })),
  );
}

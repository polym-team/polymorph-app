import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-utils';
import type { Prisma } from '@prisma/client';

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const orders = await prisma.order.findMany({
    where: { userId: user!.id },
    include: {
      round: { select: { title: true, status: true } },
      items: {
        include: {
          product: {
            select: { name: true, brand: true, store: true, imageUrl: true },
          },
          purchaseItems: {
            include: {
              purchase: {
                select: { externalOrderNo: true, status: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { roundId, deliveryLocation, items } = body as {
    roundId: number;
    deliveryLocation: 'pangyo' | 'jeju';
    items: { productId: number; quantity: number; price: number }[];
  };

  if (!roundId || !items?.length) {
    return NextResponse.json({ error: '주문 정보가 올바르지 않습니다' }, { status: 400 });
  }

  const round = await prisma.orderRound.findFirst({
    where: { id: roundId, status: 'open' },
  });
  if (!round) {
    return NextResponse.json({ error: '현재 열려있는 주문 라운드가 아닙니다' }, { status: 400 });
  }

  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Delete existing order if any
    const existing = await tx.order.findUnique({
      where: { roundId_userId: { roundId, userId: user!.id } },
    });

    if (existing) {
      await tx.orderItem.deleteMany({ where: { orderId: existing.id } });
      await tx.order.delete({ where: { id: existing.id } });
    }

    return tx.order.create({
      data: {
        roundId,
        userId: user!.id,
        deliveryLocation: deliveryLocation || 'pangyo',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.price,
          })),
        },
      },
    });
  });

  return NextResponse.json({ orderId: order.id });
}

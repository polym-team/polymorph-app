import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-utils';
import type { Prisma } from '@/generated/prisma';

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
                select: { id: true, externalOrderNo: true, status: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 사용자 주문이 연결된 모든 purchase의 배송비 분담액 계산
  // (settlement 로직과 동일: 한 purchase의 shippingFee를 참여 유저 수로 나눔)
  const purchaseIds = new Set<number>();
  for (const order of orders) {
    for (const item of order.items) {
      for (const pi of item.purchaseItems) {
        purchaseIds.add(pi.purchase.id);
      }
    }
  }

  const purchases = purchaseIds.size > 0
    ? await prisma.purchase.findMany({
        where: { id: { in: [...purchaseIds] }, shippingFee: { gt: 0 } },
        include: {
          items: {
            include: { orderItem: { select: { order: { select: { userId: true } } } } },
          },
        },
      })
    : [];

  const purchaseShareMap = new Map<number, number>();
  for (const p of purchases) {
    const userIds = new Set(p.items.map((pi) => pi.orderItem.order.userId));
    if (userIds.size === 0) continue;
    purchaseShareMap.set(p.id, Math.ceil(p.shippingFee / userIds.size));
  }

  const enriched = orders.map((order) => {
    const orderPurchaseIds = new Set<number>();
    for (const item of order.items) {
      for (const pi of item.purchaseItems) {
        orderPurchaseIds.add(pi.purchase.id);
      }
    }
    const shippingShare = [...orderPurchaseIds].reduce(
      (sum, pid) => sum + (purchaseShareMap.get(pid) ?? 0),
      0,
    );
    return { ...order, shippingShare };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { roundId, deliveryLocation, customName, customPhone, customAddress, items } = body as {
    roundId: number;
    deliveryLocation: 'pangyo' | 'jeju' | 'custom';
    customName?: string;
    customPhone?: string;
    customAddress?: string;
    items: { productId: number; optionId?: number | null; optionName?: string | null; quantity: number; price: number }[];
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
        deliveryLocation: deliveryLocation || 'jeju',
        ...(deliveryLocation === 'custom' ? {
          customName: customName ?? null,
          customPhone: customPhone ?? null,
          customAddress: customAddress ?? null,
        } : {}),
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            optionId: item.optionId ?? null,
            optionName: item.optionName ?? null,
            quantity: item.quantity,
            priceAtOrder: item.price,
          })),
        },
      },
    });
  });

  return NextResponse.json({ orderId: order.id });
}

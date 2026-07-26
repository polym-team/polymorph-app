import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-utils';
import { nameMatches } from '@/lib/deposit-matcher';
import { fetchDeposits } from '@/lib/tallo';
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
    const itemsTotal = order.items
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0);
    return { ...order, shippingShare, total: itemsTotal + shippingShare };
  });

  // 조기 입금/크론 반영 전 안내: 아직 정산 안 된 주문에 대해, 원장에 "이 주문 금액 +
  // 이름"과 맞는 미소비 입금이 있으면 "입금 확인됨(반영 대기)"으로 표시.
  // (정산대기 전 조기 입금 + 크론 10분 지연 모두 커버, 이름·금액 정확 매칭이라 오탐 방지)
  // Tallo 조회 실패는 조용히 무시(주문 목록 렌더는 항상 성공).
  const pendingByOrder = new Map<number, { amount: number; txAt: string }>();
  try {
    const unsettled = enriched.filter((o) => !o.matchedDepositId);
    if (unsettled.length > 0 && user!.name) {
      const usedRows = await prisma.order.findMany({
        where: { matchedDepositId: { not: null } },
        select: { matchedDepositId: true },
      });
      const usedSet = new Set(usedRows.map((u) => u.matchedDepositId as string));
      const from = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
      const deposits = (await fetchDeposits({ from })).filter((d) => !usedSet.has(d.externalId));
      const claimed = new Set<string>();
      for (const o of unsettled) {
        const hit = deposits.find(
          (d) =>
            !claimed.has(d.externalId) &&
            d.amount === o.total &&
            nameMatches(d.payerName, user!.name)
        );
        if (hit) {
          claimed.add(hit.externalId);
          pendingByOrder.set(o.id, { amount: hit.amount, txAt: hit.txAt });
        }
      }
    }
  } catch {
    // Tallo 불가 시 조기입금 안내만 생략(주문 조회는 정상).
  }

  const withPending = enriched.map((o) => ({
    ...o,
    depositPending: pendingByOrder.get(o.id) ?? null,
  }));

  return NextResponse.json(withPending);
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

import { prisma } from '@/lib/prisma';

/** 주문 1건의 정산(기대 입금) 내역. 라운드당 (roundId,userId) 유니크라 유저=주문 1:1. */
export interface OrderSettlement {
  orderId: number;
  userId: number;
  userName: string;
  userEmail: string;
  itemsTotal: number;
  shippingShare: number;
  total: number; // 직원이 입금해야 할 금액(items_total + shipping_share)
}

/**
 * 라운드의 주문별 기대 입금액 계산.
 * - items_total: active OrderItem의 priceAtOrder*quantity 합
 * - shipping_share: 배송비를 purchase 참여 유저 수로 나눈 몫(Math.ceil) 누적
 * 기존 GET /api/rounds/[id]/settlement와 동일 로직을 공유(자동정산 매칭에서도 재사용).
 */
export async function computeRoundSettlement(roundId: number): Promise<OrderSettlement[]> {
  const orders = await prisma.order.findMany({
    where: { roundId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  const byUser = new Map<
    number,
    { orderId: number; name: string; email: string; itemsTotal: number }
  >();
  for (const order of orders) {
    const activeItems = order.items.filter((item) => item.status === 'active');
    const itemsTotal = activeItems.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0
    );
    byUser.set(order.userId, {
      orderId: order.id,
      name: order.user.name,
      email: order.user.email,
      itemsTotal,
    });
  }

  const purchases = await prisma.purchase.findMany({
    where: { roundId, shippingFee: { gt: 0 } },
    include: {
      items: { include: { orderItem: { include: { order: { select: { userId: true } } } } } },
    },
  });

  const shippingShares = new Map<number, number>();
  for (const purchase of purchases) {
    const userIds = [...new Set(purchase.items.map((pi) => pi.orderItem.order.userId))];
    if (userIds.length === 0) continue;
    const sharePerUser = Math.ceil(purchase.shippingFee / userIds.length);
    for (const userId of userIds) {
      shippingShares.set(userId, (shippingShares.get(userId) ?? 0) + sharePerUser);
    }
  }

  return [...byUser.entries()].map(([userId, d]) => {
    const shippingShare = shippingShares.get(userId) ?? 0;
    return {
      orderId: d.orderId,
      userId,
      userName: d.name,
      userEmail: d.email,
      itemsTotal: d.itemsTotal,
      shippingShare,
      total: d.itemsTotal + shippingShare,
    };
  });
}

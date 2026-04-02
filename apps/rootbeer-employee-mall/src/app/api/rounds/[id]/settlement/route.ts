import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-utils';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const roundId = Number(id);

  // Get all orders with items for this round
  const orders = await prisma.order.findMany({
    where: { roundId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  // Calculate per-user item totals
  const userTotals = new Map<number, { name: string; email: string; itemsTotal: number }>();
  for (const order of orders) {
    const activeItems = order.items.filter((item) => item.status === 'active');
    const total = activeItems.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
    userTotals.set(order.userId, {
      name: order.user.name,
      email: order.user.email,
      itemsTotal: total,
    });
  }

  // Calculate shipping shares
  const purchases = await prisma.purchase.findMany({
    where: { roundId, shippingFee: { gt: 0 } },
    include: {
      items: {
        include: {
          orderItem: {
            include: { order: { select: { userId: true } } },
          },
        },
      },
    },
  });

  const shippingShares = new Map<number, number>();

  for (const purchase of purchases) {
    const userIds = [...new Set(purchase.items.map((pi) => pi.orderItem.order.userId))];
    const sharePerUser = Math.ceil(purchase.shippingFee / userIds.length);
    for (const userId of userIds) {
      shippingShares.set(userId, (shippingShares.get(userId) ?? 0) + sharePerUser);
    }
  }

  const settlement = [...userTotals.entries()].map(([userId, data]) => {
    const shippingShare = shippingShares.get(userId) ?? 0;
    return {
      user_id: userId,
      user_name: data.name,
      user_email: data.email,
      items_total: data.itemsTotal,
      shipping_share: shippingShare,
      total: data.itemsTotal + shippingShare,
    };
  });

  return NextResponse.json(settlement);
}

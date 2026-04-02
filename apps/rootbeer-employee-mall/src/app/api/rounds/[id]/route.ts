import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-utils';
import { notifyRoundClosed } from '@/lib/slack';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const roundId = Number(id);

  const round = await prisma.orderRound.findUnique({ where: { id: roundId } });
  if (!round) {
    return NextResponse.json({ error: '라운드를 찾을 수 없습니다' }, { status: 404 });
  }

  const orders = await prisma.order.findMany({
    where: { roundId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            select: { id: true, name: true, brand: true, store: true, imageUrl: true },
          },
        },
      },
    },
  });

  // Flatten for frontend compatibility
  const flatOrders = orders.flatMap((order) =>
    order.items.map((item) => ({
      order_id: order.id,
      user_id: order.user.id,
      user_name: order.user.name,
      user_email: order.user.email,
      delivery_location: order.deliveryLocation,
      custom_name: order.customName,
      custom_phone: order.customPhone,
      custom_address: order.customAddress,
      order_status: order.status,
      item_id: item.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_brand: item.product.brand,
      product_store: item.product.store,
      product_image_url: item.product.imageUrl,
      quantity: item.quantity,
      price_at_order: item.priceAtOrder,
      item_status: item.status,
    })),
  );

  const purchases = await prisma.purchase.findMany({
    where: { roundId },
    orderBy: { createdAt: 'asc' },
  });

  const purchaseItems = await prisma.purchaseItem.findMany({
    where: { purchase: { roundId } },
  });

  return NextResponse.json({
    round,
    orders: flatOrders,
    purchases: purchases.map((p) => ({
      id: p.id,
      store: p.store,
      external_order_no: p.externalOrderNo,
      shipping_fee: p.shippingFee,
      status: p.status,
      ordered_at: p.orderedAt,
      created_at: p.createdAt,
    })),
    purchaseItems: purchaseItems.map((pi) => ({
      purchase_id: pi.purchaseId,
      order_item_id: pi.orderItemId,
      quantity: pi.quantity,
    })),
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const roundId = Number(id);
  const body = await req.json();
  const { status } = body as { status: 'open' | 'closed' | 'ordered' | 'settled' };

  if (!status) {
    return NextResponse.json({ error: 'No updates' }, { status: 400 });
  }

  const round = await prisma.orderRound.update({
    where: { id: roundId },
    data: {
      status,
      ...(status === 'closed' ? { closedAt: new Date() } : {}),
    },
    include: { _count: { select: { orders: true } } },
  });

  if (status === 'closed' && round.slackTs) {
    await notifyRoundClosed(round.slackTs, round.title, round._count.orders);
  }

  return NextResponse.json({ success: true });
}

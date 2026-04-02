import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-utils';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const roundId = Number(id);
  const body = await req.json();
  const { store, orderItemIds } = body as {
    store: 'amoremall' | 'innisfree';
    orderItemIds: { orderItemId: number; quantity: number }[];
  };

  if (!store || !orderItemIds?.length) {
    return NextResponse.json({ error: '구매 정보가 올바르지 않습니다' }, { status: 400 });
  }

  const round = await prisma.orderRound.findUnique({ where: { id: roundId } });
  if (!round || round.status === 'open') {
    return NextResponse.json({ error: '라운드가 마감된 이후에만 구매를 생성할 수 있습니다' }, { status: 400 });
  }

  const purchase = await prisma.purchase.create({
    data: {
      roundId,
      store,
      items: {
        create: orderItemIds.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
        })),
      },
    },
  });

  return NextResponse.json({ purchaseId: purchase.id });
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { purchaseId, externalOrderNo, shippingFee, status } = body as {
    purchaseId: number;
    externalOrderNo?: string;
    shippingFee?: number;
    status?: 'pending' | 'ordered' | 'delivered' | 'settled';
  };

  await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      ...(externalOrderNo !== undefined ? { externalOrderNo } : {}),
      ...(shippingFee !== undefined ? { shippingFee } : {}),
      ...(status ? { status } : {}),
      ...(status === 'ordered' ? { orderedAt: new Date() } : {}),
    },
  });

  return NextResponse.json({ success: true });
}

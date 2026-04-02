import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-utils';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const orderId = Number(id);

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user!.id,
      round: { status: 'open' },
    },
  });

  if (!order) {
    return NextResponse.json({ error: '삭제할 수 없는 주문입니다' }, { status: 400 });
  }

  await prisma.order.delete({ where: { id: orderId } });
  return NextResponse.json({ success: true });
}

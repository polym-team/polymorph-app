import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-utils';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const roundId = Number(id);

  const round = await prisma.orderRound.findUnique({ where: { id: roundId } });
  if (!round || round.status === 'open') {
    return NextResponse.json({ error: '라운드가 마감된 이후에만 품절 처리할 수 있습니다' }, { status: 400 });
  }

  const body = await req.json();
  const { orderItemIds, status } = body as {
    orderItemIds: number[];
    status: 'active' | 'soldout';
  };

  if (!orderItemIds?.length || !status) {
    return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
  }

  await prisma.orderItem.updateMany({
    where: {
      id: { in: orderItemIds },
      order: { roundId },
    },
    data: { status },
  });

  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/api-utils';
import { notifyRoundOpened } from '@/lib/slack';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const rounds = await prisma.orderRound.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    rounds.map((r) => ({ ...r, order_count: r._count.orders })),
  );
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { title, deadline } = body as { title?: string; deadline?: string };

  const deadlineDate = deadline ? new Date(deadline) : null;

  const round = await prisma.orderRound.create({
    data: {
      title: title || null,
      deadline: deadlineDate,
    },
  });

  const slackTs = await notifyRoundOpened(title || null, deadlineDate);
  if (slackTs) {
    await prisma.orderRound.update({
      where: { id: round.id },
      data: { slackTs },
    });
  }

  return NextResponse.json({ id: round.id });
}

import { prisma } from './prisma';
import { notifyRoundClosed, notifyRoundOpened } from './slack';

const DEFAULT_NEXT_DEADLINE_DAYS = 7;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 라운드를 마감하고 같은 트랜잭션 안에서 다음 open 라운드를 생성한다.
 * 트랜잭션 외부에서 마감/오픈 슬랙 알림을 발송하고 새 라운드의 slackTs를 저장한다.
 *
 * 이미 마감된 라운드(status !== 'open')에 대해 호출되면 null 반환.
 */
export async function closeRoundAndOpenNext(roundId: number) {
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.orderRound.updateMany({
      where: { id: roundId, status: 'open' },
      data: { status: 'closed', closedAt: new Date() },
    });

    if (updated.count === 0) {
      return null;
    }

    const closed = await tx.orderRound.findUniqueOrThrow({
      where: { id: roundId },
      include: { _count: { select: { orders: true } } },
    });

    const nextDeadline = addDays(new Date(), DEFAULT_NEXT_DEADLINE_DAYS);
    const next = await tx.orderRound.create({
      data: { deadline: nextDeadline },
    });

    return { closed, next };
  });

  if (!result) return null;

  const { closed, next } = result;

  if (closed.slackTs) {
    await notifyRoundClosed(closed.slackTs, closed.title, closed._count.orders);
  }

  const slackTs = await notifyRoundOpened(next.title, next.deadline);
  if (slackTs) {
    await prisma.orderRound.update({
      where: { id: next.id },
      data: { slackTs },
    });
  }

  return { closedRoundId: closed.id, nextRoundId: next.id };
}

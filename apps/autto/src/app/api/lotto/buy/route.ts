import { NextResponse } from 'next/server';
import { requireAuth, createDhClient } from '@/lib/api-utils';
import { isPurchaseBlocked, getPurchaseBlockMessage, Lotto645Mode } from '@/lib/dhlottery';
import type { Lotto645Ticket } from '@/lib/dhlottery';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (isPurchaseBlocked()) {
    return NextResponse.json({ error: getPurchaseBlockMessage() }, { status: 403 });
  }

  const body = await req.json().catch(() => ({})) as { accountId: number };
  if (!body.accountId) {
    return NextResponse.json({ error: 'accountId가 필요합니다.' }, { status: 400 });
  }

  // 계정의 프리셋에서 티켓 생성
  const account = await prisma.dhAccount.findFirst({
    where: { id: body.accountId, userId: user!.id },
    include: { presets: { orderBy: { slot: 'asc' } } },
  });

  if (!account) {
    return NextResponse.json({ error: '계정을 찾을 수 없습니다.' }, { status: 404 });
  }

  const tickets: Lotto645Ticket[] = account.presets.map((p) => {
    if (p.mode === 'manual' && p.numbers) {
      const nums = p.numbers.split(',').map(Number).filter((n) => n >= 1 && n <= 45);
      return {
        mode: nums.length === 6 ? Lotto645Mode.MANUAL : nums.length > 0 ? Lotto645Mode.SEMIAUTO : Lotto645Mode.AUTO,
        numbers: nums,
      };
    }
    return { mode: Lotto645Mode.AUTO, numbers: [] };
  });

  if (tickets.length === 0) {
    return NextResponse.json({ error: '구매할 티켓이 없습니다.' }, { status: 400 });
  }

  const { client, error: clientError } = await createDhClient(body.accountId, user!.id);
  if (clientError) return clientError;

  const result = await client!.buyLotto645(tickets);

  if (result.success) {
    await prisma.purchaseLog.create({
      data: {
        accountId: body.accountId,
        roundNo: result.roundNo,
        ticketCount: tickets.length,
        totalAmount: tickets.length * 1000,
        slots: JSON.stringify(result.slots),
        source: 'manual',
      },
    });
  }

  return NextResponse.json(result);
}

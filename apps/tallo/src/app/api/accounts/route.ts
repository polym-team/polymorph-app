export const dynamic = 'force-dynamic';

import { requireUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';

/** GET /api/accounts — 내 감시 계좌 목록. */
export async function GET(req: Request): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const accounts = await prisma.account.findMany({
    where: { userId: auth.userId },
    orderBy: { id: 'desc' },
    select: {
      id: true,
      bank: true,
      accountNumber: true,
      label: true,
      notificationConfirmedAt: true,
      createdAt: true,
    },
  });

  // 등록 확인 여부 = 이 계좌의 첫 은행 SMS 유입으로 자동 세팅된 notificationConfirmedAt 존재
  const items = accounts.map((a) => ({ ...a, confirmed: a.notificationConfirmedAt != null }));
  return Response.json({ items });
}

/** POST /api/accounts — 감시 계좌 등록(웹). 계좌번호 전체 저장. */
export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { bank?: unknown; accountNumber?: unknown; label?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ message: '잘못된 JSON 본문입니다.' }, { status: 400 });
  }

  if (typeof body.accountNumber !== 'string' || !body.accountNumber.trim()) {
    return Response.json({ message: 'accountNumber는 필수입니다.' }, { status: 400 });
  }
  const bank =
    typeof body.bank === 'string' && body.bank.trim() ? body.bank.trim() : 'woori';
  const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim() : null;

  const account = await prisma.account.create({
    data: { userId: auth.userId, bank, accountNumber: body.accountNumber.trim(), label },
    select: { id: true, bank: true, accountNumber: true, label: true, createdAt: true },
  });

  return Response.json(account, { status: 201 });
}

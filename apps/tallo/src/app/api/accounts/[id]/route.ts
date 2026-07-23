export const dynamic = 'force-dynamic';

import { requireUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';

async function ownedAccount(userId: string, idRaw: string) {
  const id = Number(idRaw);
  if (!Number.isInteger(id)) return null;
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account || account.userId !== userId) return null;
  return account;
}

/** PATCH /api/accounts/[id] — 라벨/계좌번호/은행 수정(소유자). */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const account = await ownedAccount(auth.userId, params.id);
  if (!account) return Response.json({ message: '계좌를 찾을 수 없습니다.' }, { status: 404 });

  let body: { bank?: unknown; accountNumber?: unknown; label?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ message: '잘못된 JSON 본문입니다.' }, { status: 400 });
  }

  const data: { bank?: string; accountNumber?: string; label?: string | null } = {};
  if (typeof body.bank === 'string' && body.bank.trim()) data.bank = body.bank.trim();
  if (typeof body.accountNumber === 'string' && body.accountNumber.trim())
    data.accountNumber = body.accountNumber.trim();
  if (typeof body.label === 'string') data.label = body.label.trim() || null;

  const updated = await prisma.account.update({
    where: { id: account.id },
    data,
    select: { id: true, bank: true, accountNumber: true, label: true },
  });
  return Response.json(updated);
}

/** DELETE /api/accounts/[id] — 계좌 삭제(소유자). */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const account = await ownedAccount(auth.userId, params.id);
  if (!account) return Response.json({ message: '계좌를 찾을 수 없습니다.' }, { status: 404 });

  await prisma.account.delete({ where: { id: account.id } });
  return Response.json({ id: account.id, deleted: true });
}

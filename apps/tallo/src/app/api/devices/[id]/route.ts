export const dynamic = 'force-dynamic';

import { requireUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';

async function ownedDevice(userId: string, idRaw: string) {
  const id = Number(idRaw);
  if (!Number.isInteger(id)) return null;
  const device = await prisma.device.findUnique({ where: { id } });
  if (!device || device.userId !== userId) return null;
  return device;
}

/** PATCH /api/devices/[id] — 라벨/번호 수정(소유자). */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const device = await ownedDevice(auth.userId, params.id);
  if (!device) return Response.json({ message: '디바이스를 찾을 수 없습니다.' }, { status: 404 });

  let body: { name?: unknown; phoneNumber?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ message: '잘못된 JSON 본문입니다.' }, { status: 400 });
  }

  const data: { name?: string | null; phoneNumber?: string | null } = {};
  if (typeof body.name === 'string') data.name = body.name.trim() || null;
  if (typeof body.phoneNumber === 'string') data.phoneNumber = body.phoneNumber.trim() || null;

  const updated = await prisma.device.update({
    where: { id: device.id },
    data,
    select: { id: true, name: true, phoneNumber: true, platform: true },
  });
  return Response.json(updated);
}

/** DELETE /api/devices/[id] — 디바이스 삭제(소유자). 발급된 ingest 토큰도 폐기. */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const device = await ownedDevice(auth.userId, params.id);
  if (!device) return Response.json({ message: '디바이스를 찾을 수 없습니다.' }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    if (device.ingestTokenId != null) {
      await tx.apiToken
        .update({ where: { id: device.ingestTokenId }, data: { revokedAt: new Date() } })
        .catch(() => undefined);
    }
    await tx.device.delete({ where: { id: device.id } });
  });

  return Response.json({ id: device.id, deleted: true });
}

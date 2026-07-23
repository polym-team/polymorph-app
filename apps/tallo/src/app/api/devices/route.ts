export const dynamic = 'force-dynamic';

import { requireUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';

/** GET /api/devices — 내 디바이스 목록. */
export async function GET(req: Request): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const devices = await prisma.device.findMany({
    where: { userId: auth.userId },
    orderBy: { id: 'desc' },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      platform: true,
      notificationConfirmedAt: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });

  // 등록 확인 여부 = 첫 은행 SMS 유입으로 자동 세팅된 notificationConfirmedAt 존재
  const items = devices.map((d) => ({ ...d, confirmed: d.notificationConfirmedAt != null }));
  return Response.json({ items });
}

/** POST /api/devices — 디바이스 엔롤(앱 최초 설치 시). */
export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { name?: unknown; phoneNumber?: unknown; platform?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ message: '잘못된 JSON 본문입니다.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null;
  const phoneNumber =
    typeof body.phoneNumber === 'string' && body.phoneNumber.trim()
      ? body.phoneNumber.trim()
      : null;
  const platform =
    typeof body.platform === 'string' && body.platform.trim() ? body.platform.trim() : 'android';

  const device = await prisma.device.create({
    data: { userId: auth.userId, name, phoneNumber, platform, lastSeenAt: new Date() },
    select: { id: true, name: true, phoneNumber: true, platform: true, createdAt: true },
  });

  return Response.json(device, { status: 201 });
}

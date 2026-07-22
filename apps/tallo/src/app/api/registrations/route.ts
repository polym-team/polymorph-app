export const dynamic = 'force-dynamic';

import { requireUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { REGISTRATION_TTL_MS, RegStatus, expireStaleSessions } from '@/lib/registration';

/** GET /api/registrations?deviceId=&status= — 내 등록 세션 목록(앱 폴링/웹 조회). */
export async function GET(req: Request): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const deviceIdRaw = url.searchParams.get('deviceId');
  const status = url.searchParams.get('status');

  await expireStaleSessions();

  const deviceId = deviceIdRaw ? Number(deviceIdRaw) : undefined;
  if (deviceIdRaw && (deviceId === undefined || !Number.isInteger(deviceId))) {
    return Response.json({ message: 'deviceId가 유효하지 않습니다.' }, { status: 400 });
  }

  const items = await prisma.registrationSession.findMany({
    where: {
      userId: auth.userId,
      ...(deviceId ? { deviceId } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { id: 'desc' },
    select: {
      id: true,
      deviceId: true,
      bank: true,
      phoneNumber: true,
      status: true,
      otpCode: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return Response.json({ items });
}

/** POST /api/registrations — 등록 세션 시작(웹). 번호 단위 상호배제(409). */
export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { deviceId?: unknown; bank?: unknown; accountKey?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ message: '잘못된 JSON 본문입니다.' }, { status: 400 });
  }

  const deviceId = Number(body.deviceId);
  if (!Number.isInteger(deviceId)) {
    return Response.json({ message: 'deviceId는 필수입니다.' }, { status: 400 });
  }
  if (typeof body.bank !== 'string' || !body.bank.trim()) {
    return Response.json({ message: 'bank는 필수입니다.' }, { status: 400 });
  }
  const accountKey =
    typeof body.accountKey === 'string' && body.accountKey.trim() ? body.accountKey.trim() : null;

  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device || device.userId !== auth.userId) {
    return Response.json({ message: '디바이스를 찾을 수 없습니다.' }, { status: 404 });
  }
  if (!device.phoneNumber) {
    return Response.json(
      { message: '디바이스에 전화번호가 없습니다. 먼저 번호를 등록하세요.' },
      { status: 400 }
    );
  }

  const phoneNumber = device.phoneNumber;
  const expiresAt = new Date(Date.now() + REGISTRATION_TTL_MS);

  // 상호배제: 만료 정리 후, 같은 번호에 active 세션 있으면 409.
  // (사람이 클릭하는 저빈도 흐름이라 트랜잭션 내 체크로 충분. 고동시성 시 FOR UPDATE/락테이블로 강화)
  try {
    const session = await prisma.$transaction(async (tx) => {
      await tx.registrationSession.updateMany({
        where: { phoneNumber, status: RegStatus.awaitingOtp, expiresAt: { lt: new Date() } },
        data: { status: RegStatus.expired },
      });
      const active = await tx.registrationSession.findFirst({
        where: { phoneNumber, status: RegStatus.awaitingOtp },
        select: { id: true },
      });
      if (active) throw new Error('CONFLICT');
      return tx.registrationSession.create({
        data: {
          userId: auth.userId,
          deviceId,
          bank: body.bank as string,
          accountKey,
          phoneNumber,
          status: RegStatus.awaitingOtp,
          expiresAt,
        },
        select: {
          id: true,
          deviceId: true,
          bank: true,
          phoneNumber: true,
          status: true,
          expiresAt: true,
        },
      });
    });
    return Response.json(session, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'CONFLICT') {
      return Response.json(
        { message: '이 번호로 진행 중인 등록이 있습니다. 완료되거나 만료된 뒤 다시 시도하세요.' },
        { status: 409 }
      );
    }
    throw e;
  }
}

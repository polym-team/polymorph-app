export const dynamic = 'force-dynamic';

import { requireUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { RegStatus, isActive } from '@/lib/registration';

/** GET /api/registrations/[id] — 세션 상태 조회(웹 폴링: OTP 실시간 확인). */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ message: 'id가 유효하지 않습니다.' }, { status: 400 });
  }

  const session = await prisma.registrationSession.findUnique({ where: { id } });
  if (!session || session.userId !== auth.userId) {
    return Response.json({ message: '세션을 찾을 수 없습니다.' }, { status: 404 });
  }

  // lazy 만료: awaiting_otp인데 시간이 지났으면 expired로 반영해서 응답
  let status = session.status;
  if (session.status === RegStatus.awaitingOtp && session.expiresAt.getTime() <= Date.now()) {
    await prisma.registrationSession.update({
      where: { id },
      data: { status: RegStatus.expired },
    });
    status = RegStatus.expired;
  }

  return Response.json({
    id: session.id,
    deviceId: session.deviceId,
    bank: session.bank,
    phoneNumber: session.phoneNumber,
    status,
    otpCode: session.otpCode,
    otpReceivedAt: session.otpReceivedAt,
    expiresAt: session.expiresAt,
    active: isActive({ status, expiresAt: session.expiresAt }),
  });
}

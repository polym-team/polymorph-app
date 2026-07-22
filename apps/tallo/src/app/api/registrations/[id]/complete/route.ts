export const dynamic = 'force-dynamic';

import { requireUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { RegStatus, isActive } from '@/lib/registration';
import { issueApiToken } from '@/lib/tokens';

/**
 * POST /api/registrations/[id]/complete — 은행 등록 완료 확정(웹).
 * verified 전환 + 잠금 해제 + 디바이스에 ingest 토큰 발급(데이터 평면). OTP는 폐기.
 * 응답에 토큰 원문 1회 노출.
 */
export async function POST(
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
  if (session.status === RegStatus.verified) {
    return Response.json({ message: '이미 완료된 세션입니다.' }, { status: 409 });
  }
  if (!isActive(session)) {
    return Response.json(
      { message: '진행 중(awaiting_otp)인 세션이 아닙니다.' },
      { status: 409 }
    );
  }

  const device = await prisma.device.findUnique({ where: { id: session.deviceId } });
  if (!device) {
    return Response.json({ message: '디바이스를 찾을 수 없습니다.' }, { status: 404 });
  }

  // ingest 토큰 발급 → 디바이스 바인딩 → 세션 verified + OTP 폐기
  const tokenName = device.name ? `device-${device.id}-${device.name}` : `device-${device.id}`;
  const issued = await issueApiToken(tokenName, 'ingest');

  await prisma.$transaction([
    prisma.device.update({
      where: { id: device.id },
      data: { ingestTokenId: issued.id },
    }),
    prisma.registrationSession.update({
      where: { id },
      data: { status: RegStatus.verified, verifiedAt: new Date(), otpCode: null },
    }),
  ]);

  return Response.json({
    id: session.id,
    status: RegStatus.verified,
    deviceId: device.id,
    ingestToken: issued.token, // 원문 — 앱이 받아 secure-store에 저장
  });
}

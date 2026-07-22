export const dynamic = 'force-dynamic';

import { requireUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { isActive } from '@/lib/registration';

/**
 * POST /api/registrations/[id]/otp — 앱이 캡처한 은행 인증번호(OTP) 릴레이.
 * 세션이 active(awaiting_otp & 미만료)일 때만 저장. 웹이 폴링으로 표시한다.
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

  let body: { code?: unknown; rawText?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ message: '잘못된 JSON 본문입니다.' }, { status: 400 });
  }
  if (typeof body.code !== 'string' || !body.code.trim()) {
    return Response.json({ message: 'code는 필수입니다.' }, { status: 400 });
  }

  const session = await prisma.registrationSession.findUnique({ where: { id } });
  if (!session || session.userId !== auth.userId) {
    return Response.json({ message: '세션을 찾을 수 없습니다.' }, { status: 404 });
  }
  if (!isActive(session)) {
    return Response.json(
      { message: '진행 중(awaiting_otp)인 세션이 아닙니다.' },
      { status: 409 }
    );
  }

  await prisma.registrationSession.update({
    where: { id },
    data: { otpCode: body.code.trim(), otpReceivedAt: new Date() },
  });

  return Response.json({ ok: true });
}

export const dynamic = 'force-dynamic';

import { requireUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { RegStatus } from '@/lib/registration';

/** POST /api/registrations/[id]/cancel — 등록 세션 취소(웹). 잠금 해제. */
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
  if (session.status !== RegStatus.awaitingOtp) {
    return Response.json({ id, status: session.status });
  }

  await prisma.registrationSession.update({
    where: { id },
    data: { status: RegStatus.canceled },
  });
  return Response.json({ id, status: RegStatus.canceled });
}

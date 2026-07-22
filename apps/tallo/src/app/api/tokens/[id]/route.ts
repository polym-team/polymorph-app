export const dynamic = 'force-dynamic';

import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/tokens/[id] — 토큰 폐기(관리자 전용).
 * 레코드를 지우지 않고 revokedAt을 찍어 감사 흔적을 남긴다(멱등).
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  if (!isAdmin(req)) {
    return Response.json(
      { message: '관리자 인증(TALLO_ADMIN_TOKEN)이 필요합니다.' },
      { status: 401 }
    );
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ message: 'id가 유효하지 않습니다.' }, { status: 400 });
  }

  const existing = await prisma.apiToken.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ message: '토큰을 찾을 수 없습니다.' }, { status: 404 });
  }
  if (existing.revokedAt) {
    return Response.json({ id, revoked: true });
  }

  await prisma.apiToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  return Response.json({ id, revoked: true });
}

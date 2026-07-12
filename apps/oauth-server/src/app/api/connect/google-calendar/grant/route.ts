import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/tokenCrypto';
import { revokeCalendarToken } from '@/lib/googleCalendar';

/**
 * 캘린더 연동 상태 조회 / 해제 (사용자 본인 세션 기반)
 *
 * GET    /api/connect/google-calendar/grant → { connected, scopes?, connectedAt? }
 * DELETE /api/connect/google-calendar/grant → 구글 토큰 폐기(best-effort) + grant 삭제
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const grant = await prisma.googleCalendarGrant.findUnique({
    where: { userId },
    select: { scopes: true, createdAt: true },
  });

  return NextResponse.json({
    connected: !!grant,
    scopes: grant?.scopes,
    connectedAt: grant?.createdAt,
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const grant = await prisma.googleCalendarGrant.findUnique({ where: { userId } });
  if (!grant) {
    return NextResponse.json({ success: true, alreadyDisconnected: true });
  }

  // 구글 측 refresh token 폐기 (실패해도 로컬 grant 는 삭제)
  try {
    await revokeCalendarToken(decryptToken(grant.refreshToken));
  } catch (err) {
    console.error('[google-calendar grant] 토큰 폐기 실패(무시하고 삭제 진행):', err);
  }

  await prisma.googleCalendarGrant.delete({ where: { userId } });
  return NextResponse.json({ success: true });
}

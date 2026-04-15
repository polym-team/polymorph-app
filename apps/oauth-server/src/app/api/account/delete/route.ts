import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 계정 삭제 (탈퇴)
 * 현재 User + 모든 Account 삭제
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User 삭제 시 Cascade로 Account도 함께 삭제
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 현재 유저의 프로필 + 연결된 소셜 계정 목록
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: {
        select: { id: true, provider: true, providerAccountId: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json(user);
}

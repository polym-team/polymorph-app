import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 소셜 계정 연동 해제
 * Body: { accountId: string }
 * 마지막 1개는 해제 불가 (계정 접근 불능 방지)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { accountId?: string };
  if (!body.accountId) {
    return NextResponse.json({ error: 'accountId가 필요합니다.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true },
  });
  if (!user) {
    return NextResponse.json({ error: '사용자 없음' }, { status: 404 });
  }

  if (user.accounts.length <= 1) {
    return NextResponse.json(
      { error: '최소 1개의 연결된 계정이 필요합니다.' },
      { status: 400 },
    );
  }

  const target = user.accounts.find((a) => a.id === body.accountId);
  if (!target) {
    return NextResponse.json({ error: '해당 계정이 연결되어 있지 않습니다.' }, { status: 404 });
  }

  await prisma.account.delete({ where: { id: target.id } });

  return NextResponse.json({ success: true });
}

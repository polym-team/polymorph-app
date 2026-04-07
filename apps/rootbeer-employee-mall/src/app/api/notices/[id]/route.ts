import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-utils';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const notice = await prisma.notice.findUnique({ where: { id: Number(id) } });

  if (!notice) {
    return NextResponse.json({ error: '공지사항을 찾을 수 없습니다' }, { status: 404 });
  }

  return NextResponse.json(notice);
}

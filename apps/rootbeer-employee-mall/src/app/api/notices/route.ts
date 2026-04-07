import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-utils';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const notices = await prisma.notice.findMany({
    orderBy: { noticeDate: 'desc' },
    select: { id: true, externalId: true, title: true, noticeDate: true },
  });

  return NextResponse.json(notices);
}

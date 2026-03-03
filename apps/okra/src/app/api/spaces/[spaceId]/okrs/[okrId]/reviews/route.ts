import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership, getOKROwnership } from '@/shared/lib/permissions';
import { createReviewSchema } from '@/shared/schemas/okr';

type RouteParams = { params: Promise<{ spaceId: string; okrId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ownership = await getOKROwnership(user.id, okrId);
  if (!ownership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  if (okr.status !== 'REVIEW') {
    return NextResponse.json({ error: 'OKR is not in REVIEW status' }, { status: 400 });
  }

  const existing = await prisma.review.findUnique({
    where: { okrId_authorId: { okrId, authorId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Review already exists' }, { status: 409 });
  }

  const body = await request.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      okrId,
      authorId: user.id,
      content: parsed.data.content,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(review, { status: 201 });
}

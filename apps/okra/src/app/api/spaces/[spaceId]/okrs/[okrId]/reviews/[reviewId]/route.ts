import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership, getOKROwnership } from '@/shared/lib/permissions';
import { updateReviewSchema } from '@/shared/schemas/okr';

type RouteParams = { params: Promise<{ spaceId: string; okrId: string; reviewId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId, reviewId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.okrId !== okrId) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  if (review.authorId !== user.id) {
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

  const body = await request.json();
  const parsed = updateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { content: parsed.data.content },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId, reviewId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.okrId !== okrId) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  if (review.authorId !== user.id) {
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

  await prisma.review.delete({ where: { id: reviewId } });

  return NextResponse.json({ success: true });
}

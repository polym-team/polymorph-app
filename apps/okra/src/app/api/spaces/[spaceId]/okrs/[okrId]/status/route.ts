import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership, getOKROwnership } from '@/shared/lib/permissions';
import { updateOKRStatusSchema } from '@/shared/schemas/okr';
import { OKRStatus } from '@prisma/client';

type RouteParams = { params: Promise<{ spaceId: string; okrId: string }> };

const STATUS_ORDER: OKRStatus[] = ['PLANNING', 'ACTIVE', 'REVIEW', 'ARCHIVED'];

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

  const body = await request.json();
  const parsed = updateOKRStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status: newStatus } = parsed.data;
  const currentIndex = STATUS_ORDER.indexOf(okr.status);
  const newIndex = STATUS_ORDER.indexOf(newStatus);

  if (newIndex <= currentIndex) {
    return NextResponse.json(
      { error: 'Status can only move forward (PLANNING → ACTIVE → REVIEW → ARCHIVED)' },
      { status: 400 },
    );
  }

  if (okr.status === 'PLANNING' && newStatus === 'ACTIVE') {
    const counts = await prisma.oKR.findFirst({
      where: { id: okrId },
      include: {
        _count: { select: { objectives: true } },
        objectives: { include: { _count: { select: { tasks: true } } }, take: 1 },
      },
    });

    const hasObjective = (counts?._count.objectives ?? 0) > 0;
    const hasTask = counts?.objectives.some((o) => o._count.tasks > 0) ?? false;

    if (!hasObjective || !hasTask) {
      return NextResponse.json(
        { error: 'ACTIVE 전환에는 최소 1개 Objective와 1개 Task가 필요합니다' },
        { status: 400 },
      );
    }
  }

  const updated = await prisma.oKR.update({
    where: { id: okrId },
    data: { status: newStatus },
  });

  return NextResponse.json(updated);
}

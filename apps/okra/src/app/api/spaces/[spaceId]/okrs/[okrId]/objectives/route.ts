import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { createObjectiveSchema } from '@/shared/schemas/okr';

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

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  if (okr.status !== 'PLANNING') {
    return NextResponse.json({ error: 'Objectives can only be added during PLANNING' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = createObjectiveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const maxOrder = await prisma.objective.aggregate({
    where: { okrId },
    _max: { sortOrder: true },
  });

  const objective = await prisma.objective.create({
    data: {
      okrId,
      ownerId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { progress: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return NextResponse.json(objective, { status: 201 });
}

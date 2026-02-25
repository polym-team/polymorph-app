import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { updateObjectiveSchema } from '@/shared/schemas/okr';

type RouteParams = { params: Promise<{ spaceId: string; okrId: string; objectiveId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId, objectiveId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  if (okr.status !== 'PLANNING') {
    return NextResponse.json({ error: 'Objectives can only be edited during PLANNING' }, { status: 400 });
  }

  const objective = await prisma.objective.findFirst({ where: { id: objectiveId, okrId } });
  if (!objective) {
    return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateObjectiveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;

  const updated = await prisma.objective.update({
    where: { id: objectiveId },
    data,
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

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId, objectiveId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  if (okr.status !== 'PLANNING') {
    return NextResponse.json({ error: 'Objectives can only be deleted during PLANNING' }, { status: 400 });
  }

  const objective = await prisma.objective.findFirst({ where: { id: objectiveId, okrId } });
  if (!objective) {
    return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
  }

  await prisma.objective.delete({ where: { id: objectiveId } });

  return NextResponse.json({ success: true });
}

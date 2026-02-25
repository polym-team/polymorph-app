import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { createTaskSchema } from '@/shared/schemas/okr';

type RouteParams = {
  params: Promise<{ spaceId: string; okrId: string; objectiveId: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
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

  if (okr.status !== 'PLANNING' && okr.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Tasks can only be added during PLANNING or ACTIVE' },
      { status: 400 }
    );
  }

  const objective = await prisma.objective.findFirst({
    where: { id: objectiveId, okrId },
  });
  if (!objective) {
    return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, assigneeMode, assigneeId, dueDate } = parsed.data;

  if (assigneeMode === 'ASSIGNED' && assigneeId) {
    const assigneeMember = await getSpaceMembership(assigneeId, spaceId);
    if (!assigneeMember) {
      return NextResponse.json(
        { error: 'Assignee must be a space member' },
        { status: 400 }
      );
    }
  }

  const maxOrder = await prisma.task.aggregate({
    where: { objectiveId },
    _max: { sortOrder: true },
  });

  const task = await prisma.task.create({
    data: {
      objectiveId,
      title,
      description,
      assigneeMode: assigneeMode ?? 'ANYONE',
      assigneeId: assigneeMode === 'ASSIGNED' ? assigneeId : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { progress: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { updateTaskSchema } from '@/shared/schemas/okr';

type RouteParams = {
  params: Promise<{ spaceId: string; okrId: string; objectiveId: string; taskId: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId, objectiveId, taskId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  const objective = await prisma.objective.findFirst({ where: { id: objectiveId, okrId } });
  if (!objective) {
    return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
  }

  const task = await prisma.task.findFirst({ where: { id: taskId, objectiveId } });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (okr.status === 'PLANNING') {
    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.assigneeMode !== undefined) data.assigneeMode = parsed.data.assigneeMode;
    if (parsed.data.dueDate !== undefined) data.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;

    if (parsed.data.assigneeMode === 'ASSIGNED' && parsed.data.assigneeId) {
      const assigneeMember = await getSpaceMembership(parsed.data.assigneeId, spaceId);
      if (!assigneeMember) {
        return NextResponse.json({ error: 'Assignee must be a space member' }, { status: 400 });
      }
      data.assigneeId = parsed.data.assigneeId;
    } else if (parsed.data.assigneeMode === 'ANYONE') {
      data.assigneeId = null;
    } else if (parsed.data.assigneeId !== undefined) {
      if (parsed.data.assigneeId) {
        const assigneeMember = await getSpaceMembership(parsed.data.assigneeId, spaceId);
        if (!assigneeMember) {
          return NextResponse.json({ error: 'Assignee must be a space member' }, { status: 400 });
        }
      }
      data.assigneeId = parsed.data.assigneeId;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { progress: true } },
      },
    });

    return NextResponse.json(updated);
  }

  if (okr.status === 'ACTIVE') {
    if (parsed.data.status !== 'DISCARDED') {
      return NextResponse.json(
        { error: 'Only status change to DISCARDED is allowed during ACTIVE' },
        { status: 400 }
      );
    }

    if (task.assigneeMode === 'ASSIGNED' && task.assigneeId !== user.id) {
      return NextResponse.json(
        { error: 'Only the assignee can discard this task' },
        { status: 403 }
      );
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: 'DISCARDED' },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { progress: true } },
      },
    });

    return NextResponse.json(updated);
  }

  return NextResponse.json(
    { error: 'Tasks cannot be edited in current OKR status' },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId, objectiveId, taskId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  if (okr.status !== 'PLANNING') {
    return NextResponse.json({ error: 'Tasks can only be deleted during PLANNING' }, { status: 400 });
  }

  const task = await prisma.task.findFirst({ where: { id: taskId, objectiveId } });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ success: true });
}

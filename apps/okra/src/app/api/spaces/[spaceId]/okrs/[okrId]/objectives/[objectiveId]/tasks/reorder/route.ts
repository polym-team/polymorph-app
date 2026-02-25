import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { reorderSchema } from '@/shared/schemas/okr';

type RouteParams = {
  params: Promise<{ spaceId: string; okrId: string; objectiveId: string }>;
};

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
    return NextResponse.json({ error: 'Reorder only allowed during PLANNING' }, { status: 400 });
  }

  const objective = await prisma.objective.findFirst({ where: { id: objectiveId, okrId } });
  if (!objective) {
    return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { orderedIds } = parsed.data;

  const existingTasks = await prisma.task.findMany({
    where: { objectiveId },
    select: { id: true },
  });
  const existingIds = new Set(existingTasks.map((t) => t.id));

  if (orderedIds.length !== existingIds.size || !orderedIds.every((id) => existingIds.has(id))) {
    return NextResponse.json({ error: 'orderedIds must match existing tasks' }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.task.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  return NextResponse.json({ success: true });
}

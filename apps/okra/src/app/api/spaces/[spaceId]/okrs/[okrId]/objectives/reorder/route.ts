import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { reorderSchema } from '@/shared/schemas/okr';

type RouteParams = { params: Promise<{ spaceId: string; okrId: string }> };

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

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  if (okr.status !== 'PLANNING') {
    return NextResponse.json({ error: 'Reorder only allowed during PLANNING' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { orderedIds } = parsed.data;

  const existing = await prisma.objective.findMany({
    where: { okrId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((o) => o.id));

  if (orderedIds.length !== existingIds.size || !orderedIds.every((id) => existingIds.has(id))) {
    return NextResponse.json({ error: 'orderedIds must match existing objectives' }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.objective.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  return NextResponse.json({ success: true });
}

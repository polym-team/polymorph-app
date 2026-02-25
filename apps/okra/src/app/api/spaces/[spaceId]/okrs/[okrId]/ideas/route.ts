import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { createIdeaSchema } from '@/shared/schemas/okr';

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
    return NextResponse.json({ error: 'Ideas can only be added during PLANNING' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = createIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const maxOrder = await prisma.idea.aggregate({
    where: { okrId },
    _max: { sortOrder: true },
  });

  const idea = await prisma.idea.create({
    data: {
      okrId,
      authorId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(idea, { status: 201 });
}

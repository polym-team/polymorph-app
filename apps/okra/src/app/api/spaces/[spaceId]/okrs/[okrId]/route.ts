import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership, getOKROwnership } from '@/shared/lib/permissions';
import { updateOKRSchema } from '@/shared/schemas/okr';

type RouteParams = { params: Promise<{ spaceId: string; okrId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({
    where: { id: okrId, spaceId },
    include: {
      owners: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      ideas: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
      objectives: {
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          assignees: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
      reviews: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  return NextResponse.json(okr);
}

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

  if (okr.status === 'ARCHIVED') {
    return NextResponse.json({ error: 'Cannot edit archived OKR' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateOKRSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, startDate, endDate } = parsed.data;

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;

  const updated = await prisma.oKR.update({
    where: { id: okrId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

  if (okr.status !== 'PLANNING') {
    return NextResponse.json(
      { error: '목표수립(PLANNING) 단계에서만 삭제할 수 있습니다' },
      { status: 400 },
    );
  }

  await prisma.oKR.delete({ where: { id: okrId } });

  return NextResponse.json({ success: true });
}

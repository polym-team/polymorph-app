import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { createOKRSchema } from '@/shared/schemas/okr';

type RouteParams = { params: Promise<{ spaceId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get('status');
  const where: { spaceId: string; status?: 'PLANNING' | 'ACTIVE' | 'REVIEW' | 'ARCHIVED' } = { spaceId };
  if (status && ['PLANNING', 'ACTIVE', 'REVIEW', 'ARCHIVED'].includes(status)) {
    where.status = status as 'PLANNING' | 'ACTIVE' | 'REVIEW' | 'ARCHIVED';
  }

  const okrs = await prisma.oKR.findMany({
    where,
    include: {
      owners: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      _count: { select: { objectives: true, ideas: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(okrs);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createOKRSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, startDate, endDate } = parsed.data;

  const okr = await prisma.$transaction(async (tx) => {
    const newOKR = await tx.oKR.create({
      data: {
        spaceId,
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    await tx.oKROwner.create({
      data: {
        okrId: newOKR.id,
        userId: user.id,
      },
    });

    return newOKR;
  });

  return NextResponse.json(okr, { status: 201 });
}

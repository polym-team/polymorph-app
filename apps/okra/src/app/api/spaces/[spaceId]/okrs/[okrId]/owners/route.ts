import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership, getOKROwnership } from '@/shared/lib/permissions';
import { addOKROwnerSchema } from '@/shared/schemas/okr';

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

  const ownership = await getOKROwnership(user.id, okrId);
  if (!ownership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  if (okr.status === 'ARCHIVED') {
    return NextResponse.json({ error: 'Cannot modify archived OKR' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = addOKROwnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { userId: targetUserId } = parsed.data;

  const targetMembership = await getSpaceMembership(targetUserId, spaceId);
  if (!targetMembership) {
    return NextResponse.json({ error: 'User is not a member of this space' }, { status: 400 });
  }

  const existingOwnership = await getOKROwnership(targetUserId, okrId);
  if (existingOwnership) {
    return NextResponse.json({ error: 'User is already an owner' }, { status: 400 });
  }

  const owner = await prisma.oKROwner.create({
    data: { okrId, userId: targetUserId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(owner, { status: 201 });
}

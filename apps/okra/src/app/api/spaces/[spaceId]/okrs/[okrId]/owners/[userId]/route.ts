import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership, getOKROwnership } from '@/shared/lib/permissions';

type RouteParams = { params: Promise<{ spaceId: string; okrId: string; userId: string }> };

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId, userId: targetUserId } = await params;

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

  const ownerCount = await prisma.oKROwner.count({ where: { okrId } });
  if (ownerCount <= 1) {
    return NextResponse.json({ error: 'OKR must have at least one owner' }, { status: 400 });
  }

  const targetOwnership = await getOKROwnership(targetUserId, okrId);
  if (!targetOwnership) {
    return NextResponse.json({ error: 'User is not an owner' }, { status: 404 });
  }

  await prisma.oKROwner.delete({
    where: { okrId_userId: { okrId, userId: targetUserId } },
  });

  return NextResponse.json({ success: true });
}

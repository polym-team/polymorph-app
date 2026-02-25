import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { updateOKRProgressSchema } from '@/shared/schemas/okr';

type RouteParams = {
  params: Promise<{
    spaceId: string;
    okrId: string;
  }>;
};

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

  if (okr.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Progress can only be edited during ACTIVE' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = updateOKRProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.oKR.update({
    where: { id: okrId },
    data: { progressContent: parsed.data.content },
    select: { id: true, progressContent: true },
  });

  return NextResponse.json(updated);
}

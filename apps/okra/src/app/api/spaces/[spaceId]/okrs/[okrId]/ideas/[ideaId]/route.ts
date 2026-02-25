import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { updateIdeaSchema } from '@/shared/schemas/okr';

type RouteParams = { params: Promise<{ spaceId: string; okrId: string; ideaId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId, ideaId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  if (okr.status !== 'PLANNING') {
    return NextResponse.json({ error: 'Ideas can only be edited during PLANNING' }, { status: 400 });
  }

  const idea = await prisma.idea.findFirst({ where: { id: ideaId, okrId } });
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.category !== undefined) data.category = parsed.data.category;

  const updated = await prisma.idea.update({
    where: { id: ideaId },
    data,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId, okrId, ideaId } = await params;

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({ where: { id: okrId, spaceId } });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  if (okr.status !== 'PLANNING') {
    return NextResponse.json({ error: 'Ideas can only be deleted during PLANNING' }, { status: 400 });
  }

  const idea = await prisma.idea.findFirst({ where: { id: ideaId, okrId } });
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  await prisma.idea.delete({ where: { id: ideaId } });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const invitation = await prisma.spaceInvitation.findUnique({
    where: { token },
    include: {
      space: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  if (invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invitation expired or invalid' }, { status: 410 });
  }

  const user = await getAuthUser(request);
  let isAlreadyMember = false;

  if (user) {
    const membership = await prisma.spaceMember.findUnique({
      where: { userId_spaceId: { userId: user.id, spaceId: invitation.spaceId } },
    });
    isAlreadyMember = !!membership;
  }

  return NextResponse.json({
    space: {
      id: invitation.space.id,
      name: invitation.space.name,
      description: invitation.space.description,
      iconEmoji: invitation.space.iconEmoji,
      memberCount: invitation.space._count.members,
    },
    expiresAt: invitation.expiresAt,
    isAlreadyMember,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await params;

  const invitation = await prisma.spaceInvitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  if (invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invitation expired or invalid' }, { status: 410 });
  }

  const existingMember = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId: user.id, spaceId: invitation.spaceId } },
  });

  if (existingMember) {
    return NextResponse.json({
      message: 'Already a member',
      spaceId: invitation.spaceId,
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.spaceMember.create({
      data: {
        userId: user.id,
        spaceId: invitation.spaceId,
        role: 'MEMBER',
      },
    });

    await tx.spaceInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    return { spaceId: invitation.spaceId };
  });

  return NextResponse.json(result, { status: 201 });
}

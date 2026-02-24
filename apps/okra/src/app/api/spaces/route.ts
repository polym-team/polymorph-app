import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';

const createSpaceSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  iconEmoji: z.string().max(4).optional(),
});

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const spaces = await prisma.space.findMany({
    where: {
      members: { some: { userId: user.id } },
    },
    include: {
      members: {
        select: { role: true, userId: true },
      },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = spaces.map((space) => {
    const myMembership = space.members.find((m) => m.userId === user.id);
    return {
      id: space.id,
      name: space.name,
      description: space.description,
      iconEmoji: space.iconEmoji,
      memberCount: space._count.members,
      myRole: myMembership?.role,
      createdAt: space.createdAt,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSpaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, description, iconEmoji } = parsed.data;

  const space = await prisma.$transaction(async (tx) => {
    const newSpace = await tx.space.create({
      data: {
        name,
        description,
        iconEmoji: iconEmoji || '🎯',
      },
    });

    await tx.spaceMember.create({
      data: {
        userId: user.id,
        spaceId: newSpace.id,
        role: 'OWNER',
      },
    });

    return newSpace;
  });

  return NextResponse.json(space, { status: 201 });
}

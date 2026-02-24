import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/shared/lib/prisma';
import { getAuthUser } from '@/shared/lib/api-auth';
import { sendInvitationEmail } from '@/shared/lib/email';
import crypto from 'crypto';

const createInvitationSchema = z.object({
  email: z.string().email().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId } = await params;

  const membership = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId: user.id, spaceId } },
  });

  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const invitations = await prisma.spaceInvitation.findMany({
    where: {
      spaceId,
      status: 'PENDING',
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(invitations);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spaceId } = await params;

  const membership = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId: user.id, spaceId } },
  });

  if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '유효하지 않은 이메일입니다.' }, { status: 400 });
  }

  const { email } = parsed.data;

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.spaceInvitation.create({
    data: {
      spaceId,
      token,
      expiresAt,
      ...(email ? { inviteeEmail: email } : {}),
    },
  });

  if (email) {
    const space = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });
    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || '';
    const inviteUrl = `${origin}/invite/${token}`;
    await sendInvitationEmail(email, space.name, inviteUrl);
  }

  return NextResponse.json(invitation, { status: 201 });
}

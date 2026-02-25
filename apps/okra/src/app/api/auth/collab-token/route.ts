import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getAuthUser } from '@/shared/lib/api-auth';
import { getSpaceMembership } from '@/shared/lib/permissions';
import { prisma } from '@/shared/lib/prisma';

const secret = new TextEncoder().encode(process.env.COLLAB_SECRET);

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const spaceId = searchParams.get('spaceId');
  const okrId = searchParams.get('okrId');

  if (!spaceId || !okrId) {
    return NextResponse.json({ error: 'Missing spaceId or okrId' }, { status: 400 });
  }

  const membership = await getSpaceMembership(user.id, spaceId);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const okr = await prisma.oKR.findFirst({
    where: { id: okrId, spaceId },
  });
  if (!okr) {
    return NextResponse.json({ error: 'OKR not found' }, { status: 404 });
  }

  const readOnly = okr.status !== 'ACTIVE';
  const room = `okr:${spaceId}:${okrId}`;

  const token = await new SignJWT({
    room,
    name: user.name,
    readOnly,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime('5m')
    .sign(secret);

  return NextResponse.json({ token });
}

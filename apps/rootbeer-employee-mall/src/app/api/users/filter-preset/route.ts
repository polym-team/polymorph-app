import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-utils';

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const dbUser = await prisma.user.findUnique({
      where: { id: user!.id },
      select: { filterPreset: true },
    });

    const preset = dbUser?.filterPreset ? JSON.parse(dbUser.filterPreset) : {};
    return NextResponse.json(preset);
  } catch (err) {
    console.error('[filter-preset GET]', err);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();

  await prisma.user.update({
    where: { id: user!.id },
    data: { filterPreset: JSON.stringify(body) },
  });

  return NextResponse.json({ success: true });
}

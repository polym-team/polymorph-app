import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronKey } from '@/lib/cron-auth';
import { notifyProductsUpdated } from '@/lib/slack';

export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  const amoremallCount = await prisma.product.count({
    where: { store: 'amoremall', soldOut: false },
  });
  const innisfreeCount = await prisma.product.count({
    where: { store: 'innisfree', soldOut: false },
  });

  await notifyProductsUpdated(amoremallCount, innisfreeCount);

  console.log(`[cron/notify] 슬랙 알림 전송: 아모레몰 ${amoremallCount}, 이니스프리 ${innisfreeCount}`);
  return NextResponse.json({ amoremall: amoremallCount, innisfree: innisfreeCount });
}

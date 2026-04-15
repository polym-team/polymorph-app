import { prisma } from '@/app/api/shared/libs/prisma';

export interface UserFavoriteItem {
  apartId: number;
  regionCode: string;
  apartName: string;
}

export async function getFavoritesByUser(userId: string): Promise<UserFavoriteItem[]> {
  const rows = await prisma.user_favorite_aparts.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { apartId: true, regionCode: true, apartName: true },
  });
  return rows;
}

export async function addFavoriteForUser(
  userId: string,
  item: UserFavoriteItem,
): Promise<void> {
  await prisma.user_favorite_aparts.upsert({
    where: { userId_apartId: { userId, apartId: item.apartId } },
    update: { regionCode: item.regionCode, apartName: item.apartName },
    create: {
      userId,
      apartId: item.apartId,
      regionCode: item.regionCode,
      apartName: item.apartName,
    },
  });
}

export async function removeFavoriteForUser(userId: string, apartId: number): Promise<void> {
  await prisma.user_favorite_aparts.deleteMany({
    where: { userId, apartId },
  });
}

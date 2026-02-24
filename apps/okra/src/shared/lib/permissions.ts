import { prisma } from './prisma';

export async function getSpaceMembership(userId: string, spaceId: string) {
  return prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId, spaceId } },
  });
}

export async function getOKROwnership(userId: string, okrId: string) {
  return prisma.oKROwner.findUnique({
    where: { okrId_userId: { okrId, userId } },
  });
}

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerUser } from '@/shared/lib/server-auth';
import { prisma } from '@/shared/lib/prisma';
import { OKRDetailHeader } from './_components/OKRDetailHeader';
import { OKROwnerSection } from './_components/OKROwnerSection';
import { OKRIdeasSection } from './_components/OKRIdeasSection';
import { OKRObjectivesSection } from './_components/OKRObjectivesSection';
import { OKRProgressSection } from './_components/OKRProgressSection';
import { OKRReviewSection } from './_components/OKRReviewSection';
import type { OKRStatus } from './_components/types';

export default async function OKRDetailPage({
  params,
}: {
  params: Promise<{ spaceId: string; okrId: string }>;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect('/login');
  }

  const { spaceId, okrId } = await params;

  const membership = await prisma.spaceMember.findUnique({
    where: { userId_spaceId: { userId: user.id, spaceId } },
  });
  if (!membership) {
    notFound();
  }

  const okr = await prisma.oKR.findFirst({
    where: { id: okrId, spaceId },
    include: {
      owners: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      ideas: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
      objectives: {
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          assignees: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
      reviews: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!okr) {
    notFound();
  }

  const isOwner = okr.owners.some((o) => o.user.id === user.id);

  // Generate a deterministic color from user ID for collaboration cursors
  const userColor = `hsl(${[...user.id].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360}, 70%, 50%)`;

  const spaceMembers = await prisma.spaceMember.findMany({
    where: { spaceId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/spaces/${spaceId}`} className="text-sm text-gray-500 hover:text-gray-700">
        ← Space로 돌아가기
      </Link>

      <div className="mt-4 space-y-8">
        <OKRDetailHeader
          okr={okr}
          spaceId={spaceId}
          isOwner={isOwner}
        />

        <OKROwnerSection
          okr={okr}
          spaceId={spaceId}
          isOwner={isOwner}
          spaceMembers={spaceMembers}
        />

        <OKRIdeasSection
          ideas={okr.ideas}
          okrStatus={okr.status as OKRStatus}
          spaceId={spaceId}
          okrId={okrId}
        />

        <OKRObjectivesSection
          objectives={okr.objectives}
          okrStatus={okr.status as OKRStatus}
          spaceId={spaceId}
          okrId={okrId}
          spaceMembers={spaceMembers}
        />

        <OKRProgressSection
          spaceId={spaceId}
          okrId={okrId}
          okrStatus={okr.status as OKRStatus}
          initialContent={okr.progressContent as any}
          userName={user.name}
          userColor={userColor}
        />

        <OKRReviewSection
          reviews={okr.reviews}
          okrStatus={okr.status as OKRStatus}
          spaceId={spaceId}
          okrId={okrId}
          currentUserId={user.id}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}

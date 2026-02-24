import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerUser } from '@/shared/lib/server-auth';
import { prisma } from '@/shared/lib/prisma';
import { MemberList } from './_components/MemberList';
import { InvitationSection } from './_components/InvitationSection';
import { OKRSection } from './_components/OKRSection';

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect('/login');
  }

  const { spaceId } = await params;

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!space) {
    notFound();
  }

  const myMembership = space.members.find((m) => m.userId === user.id);
  if (!myMembership) {
    notFound();
  }

  const isAdmin = myMembership.role === 'OWNER' || myMembership.role === 'ADMIN';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/spaces" className="text-sm text-gray-500 hover:text-gray-700">
        ← 내 Space
      </Link>

      <div className="mt-4 flex items-start gap-4">
        <span className="text-4xl">{space.iconEmoji || '🎯'}</span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{space.name}</h1>
          {space.description && (
            <p className="mt-1 text-gray-500">{space.description}</p>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <OKRSection spaceId={space.id} />

        <MemberList members={space.members} />

        {isAdmin && (
          <InvitationSection spaceId={space.id} />
        )}
      </div>
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  return <Dashboard />;
}

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/Dashboard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const h = await headers();
  const userId = h.get('x-user-id');

  if (!userId) {
    redirect('/login');
  }

  return <Dashboard />;
}

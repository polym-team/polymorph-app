import Link from 'next/link';
import { Button } from '@package/ui';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Bookmark Share</h1>
        <p className="mt-4 text-lg text-gray-600">
          Share and organize bookmarks with your GitHub organization
        </p>
        <p className="mt-2 text-gray-500">
          Perfect for onboarding new team members with essential links and resources
        </p>

        <div className="mt-8">
          {session ? (
            <Link href="/bookmarks">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg">Sign in with GitHub</Button>
            </Link>
          )}
        </div>

        <div className="mt-12 grid max-w-2xl gap-6 text-left sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold">Organize</h3>
            <p className="mt-1 text-sm text-gray-600">
              Categorize bookmarks and tag them for easy discovery
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold">Prioritize</h3>
            <p className="mt-1 text-sm text-gray-600">
              Mark important links for new member onboarding
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold">Collaborate</h3>
            <p className="mt-1 text-sm text-gray-600">
              Share access info and notes with your team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

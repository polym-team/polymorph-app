'use client';

import { signIn } from 'next-auth/react';
import { Github } from 'lucide-react';
import { Button } from '@package/ui';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
          <p className="mt-2 text-gray-600">
            Sign in with your GitHub account to access your organization bookmarks
          </p>
        </div>

        <div className="mt-8">
          <Button
            onClick={() => signIn('github', { callbackUrl: '/bookmarks' })}
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            We&apos;ll request access to view your organizations to show you relevant bookmarks.
          </p>
        </div>
      </div>
    </div>
  );
}

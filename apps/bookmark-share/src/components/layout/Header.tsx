'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { LogOut, User } from 'lucide-react';
import { Button } from '@package/ui';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Bookmark Share</h1>
        </div>

        <div className="flex items-center gap-3">
          {session?.user && (
            <>
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.username || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                )}
                <span className="text-sm font-medium">{session.user.username || session.user.name}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

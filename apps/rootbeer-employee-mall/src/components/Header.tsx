'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useCartStore } from '@/components/CartStore';

export function Header() {
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.items.length);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">
            임직원몰
          </Link>
          {session?.user?.role === 'user' || session?.user?.role === 'admin' ? (
            <>
              <Link href="/cart" className="text-sm text-gray-600 hover:text-gray-900 relative">
                장바구니
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link href="/my-orders" className="text-sm text-gray-600 hover:text-gray-900">
                내 주문
              </Link>
            </>
          ) : null}
          {session?.user?.role === 'admin' && (
            <Link href="/admin/rounds" className="text-sm text-blue-600 hover:text-blue-800">
              관리자
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="text-sm text-gray-600">{session.user.name}</span>
              {session.user.role === 'pending' && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  승인대기
                </span>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="text-sm bg-black text-white px-4 py-1.5 rounded hover:bg-gray-800"
            >
              Google 로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

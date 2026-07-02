'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from './CartStore';
import { useUiStore } from './UiStore';

const SearchIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7.5" /><line x1="21" y1="21" x2="16.8" y2="16.8" />
  </svg>
);

const CartIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const MenuIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="14" y2="17" />
  </svg>
);

export function TopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.items.length);
  const openSearch = useUiStore((s) => s.openSearch);
  const openCart = useUiStore((s) => s.openCart);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!session || session.user.role === 'pending') return null;

  const isAdmin = session.user.role === 'admin';

  const go = (href: string) => {
    setMenuOpen(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-xl border-b border-line">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="leading-none">
          <span className="block text-[9px] font-medium tracking-[0.28em] text-clay-500 mb-0.5">
            EMPLOYEE BEAUTY
          </span>
          <span className="block text-[17px] font-bold tracking-[0.02em] text-ink-900">
            ROOTBEER MALL
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={openSearch}
            aria-label="검색"
            className="w-10 h-10 rounded-full flex items-center justify-center text-ink-900 hover:bg-paper-card border border-transparent hover:border-line transition-colors"
          >
            <SearchIcon />
          </button>

          <button
            onClick={openCart}
            aria-label="장바구니"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-ink-900 hover:bg-paper-card border border-transparent hover:border-line transition-colors"
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-clay-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center tnum">
                {itemCount}
              </span>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="메뉴"
              className="w-10 h-10 rounded-full flex items-center justify-center text-ink-900 hover:bg-paper-card border border-transparent hover:border-line transition-colors"
            >
              <MenuIcon />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 w-44 bg-paper-card border border-line rounded-lg shadow-lift py-1.5 z-50">
                <button onClick={() => go('/my-orders')} className="w-full text-left px-4 py-2.5 text-sm text-ink-900 hover:bg-line-soft transition-colors">
                  내 주문
                </button>
                {isAdmin && (
                  <button onClick={() => go('/admin/rounds')} className="w-full text-left px-4 py-2.5 text-sm text-ink-900 hover:bg-line-soft transition-colors">
                    관리자
                  </button>
                )}
                <div className="my-1 border-t border-line-soft" />
                <p className="px-4 pt-1 pb-1 text-[11px] text-ink-400 truncate">{session.user.email}</p>
                <button onClick={() => signOut()} className="w-full text-left px-4 py-2.5 text-sm text-ink-600 hover:bg-line-soft transition-colors">
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

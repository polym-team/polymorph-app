'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const getLinkClassName = (href: string) => {
    const baseClass =
      'relative text-gray-600 transition-colors hover:text-gray-900 py-5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:transition-transform after:duration-300 after:origin-center';
    const activeClass = 'text-gray-900 after:scale-x-100';
    const inactiveClass = 'after:scale-x-0';

    return pathname === href
      ? `${baseClass} ${activeClass}`
      : `${baseClass} ${inactiveClass}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/transaction" className="flex items-center space-x-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
              <span className="text-xs font-bold text-white">집</span>
            </div>
            <span className="text-primary text-2xl font-bold">집사요</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/transaction"
              className={getLinkClassName('/transaction')}
            >
              실거래가 조회
            </Link>
            <Link
              href="/favorite-apart"
              className={getLinkClassName('/favorite-apart')}
            >
              저장된 아파트
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

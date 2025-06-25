'use client';

import logo from '@/assets/logo.png';
import { ROUTE_PATH } from '@/shared/consts/route';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: ROUTE_PATH.TRANSACTIONS, label: '실거래가 조회' },
    { href: ROUTE_PATH.APARTS, label: '저장된 아파트' },
  ];

  const getLinkClassName = (href: string) => {
    const baseClass =
      'relative text-gray-600 transition-colors hover:text-gray-900 py-2 px-3 rounded-md ';
    const activeClass = 'text-gray-900 bg-gray-100';
    const inactiveClass = 'hover:bg-gray-50';

    return pathname.startsWith(href)
      ? `${baseClass} ${activeClass}`
      : `${baseClass} ${inactiveClass}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href={ROUTE_PATH.TRANSACTIONS}
            className="flex h-[56px] items-center space-x-2 overflow-hidden transition-all duration-200"
          >
            <img
              src={logo.src}
              alt="집사요"
              className="h-[120px] h-[96px] w-auto -translate-x-[7px] translate-y-[3px] md:h-[120px]"
            />
          </Link>

          {/* 네비게이션 */}
          <nav className="flex items-center space-x-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={getLinkClassName(item.href)}
              >
                <span className="text-sm sm:text-base">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

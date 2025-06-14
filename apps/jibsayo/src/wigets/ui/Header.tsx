'use client';

import logo from '@/assets/logo.png';
import { ROUTE_PATH } from '@/shared/consts/route';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: ROUTE_PATH.TRANSACTIONS, label: '실거래가 조회' },
    { href: ROUTE_PATH.APARTS, label: '저장된 아파트' },
  ];

  const getLinkClassName = (href: string) => {
    const baseClass =
      'relative text-gray-600 transition-colors hover:text-gray-900 py-2 px-3 rounded-md';
    const activeClass = 'text-gray-900 bg-gray-100';
    const inactiveClass = 'hover:bg-gray-50';

    return pathname.startsWith(href)
      ? `${baseClass} ${activeClass}`
      : `${baseClass} ${inactiveClass}`;
  };

  const getMobileLinkClassName = (href: string) => {
    const baseClass =
      'block px-4 py-3 text-sm text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-50';
    const activeClass = 'text-primary bg-primary/5';

    return pathname === href ? `${baseClass} ${activeClass}` : baseClass;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href={ROUTE_PATH.TRANSACTIONS}
            className="flex h-[56px] items-center space-x-2 overflow-hidden transition-all duration-200"
            onClick={closeMenu}
          >
            <img
              src={logo.src}
              alt="집사요"
              className="h-[120px] w-auto translate-y-[4px]"
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

'use client';

import { ROUTE_PATH } from '@/shared/consts/route';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button, Typography } from '@package/ui';

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: ROUTE_PATH.TRANSACTIONS, label: '실거래가 조회' },
    { href: ROUTE_PATH.APARTS, label: '저장된 아파트' },
  ];

  const getLinkClassName = (href: string) => {
    const baseClass =
      'relative text-gray-600 transition-colors hover:text-gray-900 py-5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:transition-transform after:duration-300 after:origin-center';
    const activeClass = 'text-gray-900 after:scale-x-100';
    const inactiveClass = 'after:scale-x-0';

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
            className="flex items-center space-x-2 transition-all duration-200"
            onClick={closeMenu}
          >
            <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full sm:h-8 sm:w-8">
              <span className="text-xs font-bold text-white">집</span>
            </div>
            <span className="text-primary text-xl font-bold sm:text-2xl">
              집사요
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden items-center space-x-6 sm:flex">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={getLinkClassName(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 transition-colors duration-200 hover:text-gray-900 sm:hidden"
          >
            <div className="relative h-6 w-6">
              <Menu
                className={`absolute h-6 w-6 transition-all duration-300 ${
                  isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                }`}
              />
              <X
                className={`absolute h-6 w-6 transition-all duration-300 ${
                  isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                }`}
              />
            </div>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        <div
          className={`-mx-4 overflow-hidden border-t bg-white transition-all duration-300 ease-in-out sm:hidden ${
            isMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav>
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={getMobileLinkClassName(item.href)}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

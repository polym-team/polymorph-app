'use client';

import { ROUTE_PATH, ROUTE_PATH_LABEL } from '@/shared/consts/route';

import { BarChart3, Home, LineChart, Search, Star } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@package/utils';

const MENU = [
  { key: 'HOME' as const, icon: Home },
  { key: 'TRANSACTIONS' as const, icon: BarChart3 },
  { key: 'TRANSACTION_COMPARE' as const, icon: LineChart },
  { key: 'FAVORITES' as const, icon: Star },
  { key: 'SEARCH' as const, icon: Search },
];

/**
 * 모바일 전용 하단 네비게이션 (md 미만)
 */
export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur md:hidden">
      <div className="flex">
        {MENU.map(({ key, icon: Icon }) => {
          const path = ROUTE_PATH[key];
          const isActive = key === 'HOME' ? pathname === path : pathname.startsWith(path);
          return (
            <button
              key={key}
              onClick={() => router.push(path)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-4 text-[10px]',
                isActive ? 'text-blue-600' : 'text-gray-400',
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="whitespace-nowrap">{ROUTE_PATH_LABEL[key]}</span>
            </button>
          );
        })}
      </div>
      {/* iOS safe area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

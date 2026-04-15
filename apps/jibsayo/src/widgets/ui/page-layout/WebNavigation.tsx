import logo from '@/assets/logo.png';
import { ROUTE_PATH, ROUTE_PATH_LABEL } from '@/shared/consts/route';
import { logout, redirectToAccount, redirectToLogin } from '@/shared/services/auth';
import { useAuthStore } from '@/shared/stores/authStore';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { LogIn, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@package/ui';

const MENU_KEYS = [
  'HOME' as const,
  'TRANSACTIONS' as const,
  'TRANSACTION_COMPARE' as const,
  'FAVORITES' as const,
  'SEARCH' as const,
];

export function WebNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const isInApp = useGlobalConfigStore(s => s.isInApp);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToCenter = (key: string) => {
    const nav = navRef.current;
    const button = buttonRefs.current[key];

    if (nav && button) {
      const navWidth = nav.offsetWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;

      const scrollLeft = buttonLeft - navWidth / 2 + buttonWidth / 2;
      nav.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const activeKey = MENU_KEYS.find(key =>
      key === 'HOME'
        ? pathname === ROUTE_PATH[key]
        : pathname.startsWith(ROUTE_PATH[key])
    );

    if (activeKey) {
      setTimeout(() => {
        scrollToCenter(activeKey);
      }, 100);
    }
  }, [pathname]);

  const handleNavigationClick = (key: keyof typeof ROUTE_PATH) => {
    router.push(ROUTE_PATH[key]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-screen-md items-center justify-between gap-x-5 px-3 py-3 lg:max-w-screen-lg">
        <span
          className="flex flex-shrink-0 cursor-pointer items-center space-x-2 overflow-hidden transition-all duration-200"
          onClick={() => router.push(ROUTE_PATH.HOME)}
        >
          <span className="flex h-[40px] overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt="집사요" className="h-full w-auto" />
          </span>
        </span>

        <div className="relative min-w-0 flex-1">
          <nav
            ref={navRef}
            className="scrollbar-hide overflow-x-auto text-right"
          >
            <div className="inline-flex items-center gap-x-1 lg:gap-x-3">
              {MENU_KEYS.map(key => (
                <Button
                  key={key}
                  ref={el => {
                    buttonRefs.current[key] = el;
                  }}
                  size="sm"
                  className="flex-shrink-0 whitespace-nowrap text-xs lg:text-sm"
                  variant={
                    (key === 'HOME' ? pathname === ROUTE_PATH[key] : pathname.startsWith(ROUTE_PATH[key]))
                      ? 'primary-light'
                      : 'ghost'
                  }
                  onClick={() => handleNavigationClick(key)}
                >
                  {ROUTE_PATH_LABEL[key]}
                </Button>
              ))}
            </div>
          </nav>
        </div>

        {/* 웹뷰는 기존 deviceId 기반 흐름 유지 (TODO: 네이티브 앱 출시 후 재검토) */}
        {!isInApp && (
          <div className="relative flex-shrink-0">
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex items-center gap-1 whitespace-nowrap text-xs lg:text-sm"
                  onClick={() => setMenuOpen(v => !v)}
                >
                  <User size={14} className="text-gray-500" />
                  <span className="hidden max-w-[80px] truncate lg:inline">{user?.name ?? user?.email}</span>
                </Button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border bg-white shadow-lg">
                      <button
                        onClick={() => { setMenuOpen(false); redirectToAccount(); }}
                        className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50 lg:text-sm"
                      >
                        계정 관리
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); logout(); }}
                        className="block w-full border-t px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 lg:text-sm"
                      >
                        로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-1 whitespace-nowrap text-xs lg:text-sm"
                onClick={() => redirectToLogin()}
              >
                <LogIn size={14} />
                로그인
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

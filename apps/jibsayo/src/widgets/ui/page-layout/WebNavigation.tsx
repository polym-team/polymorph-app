import logo from '@/assets/logo.png';
import { ROUTE_PATH, ROUTE_PATH_LABEL } from '@/shared/consts/route';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { Button } from '@package/ui';

export function WebNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const MENU_KEYS = [
    'TRANSACTIONS' as const,
    'TRANSACTION_COMPARE' as const,
    'FAVORITES' as const,
    'SEARCH' as const,
  ];

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
      pathname.startsWith(ROUTE_PATH[key])
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
        <Link
          href={ROUTE_PATH.TRANSACTIONS}
          className="flex flex-shrink-0 items-center space-x-2 overflow-hidden transition-all duration-200"
        >
          <span className="flex h-[40px] overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt="집사요" className="h-full w-auto" />
          </span>
        </Link>

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
                    pathname.startsWith(ROUTE_PATH[key])
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
      </div>
    </header>
  );
}

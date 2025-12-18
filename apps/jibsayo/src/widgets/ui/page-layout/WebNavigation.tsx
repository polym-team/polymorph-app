import logo from '@/assets/logo.png';
import { ROUTE_PATH, ROUTE_PATH_LABEL } from '@/shared/consts/route';
import { PageContainer } from '@/shared/ui/PageContainer';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@package/ui';

export function WebNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigationClick = (key: keyof typeof ROUTE_PATH) => {
    router.push(ROUTE_PATH[key]);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <PageContainer>
        <div className="flex items-center">
          <Link
            href={ROUTE_PATH.TRANSACTIONS}
            className="flex flex-shrink-0 items-center space-x-2 overflow-hidden transition-all duration-200"
          >
            <span className="flex h-[40px] overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.src} alt="집사요" className="h-full w-auto" />
            </span>
          </Link>

          <div className="relative mx-5 min-w-0 flex-1">
            <nav className="scrollbar-hide flex items-center gap-x-2 overflow-x-auto">
              {[
                'TRANSACTIONS' as const,
                'TRANSACTION_COMPARE' as const,
                'FAVORITES' as const,
              ].map(key => (
                <Button
                  key={key}
                  size="sm"
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
            </nav>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
          </div>

          <div
            className="ml-auto flex flex-shrink-0 cursor-pointer items-center gap-x-1 rounded bg-gray-100 px-3 py-3 text-sm text-gray-500 transition-colors duration-200 hover:bg-gray-200 lg:w-[200px]"
            onClick={() => handleNavigationClick('SEARCH')}
          >
            <Search size={16} />
            <span className="hidden lg:block">아파트 이름으로 검색</span>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}

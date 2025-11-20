import logo from '@/assets/logo.png';
import { ROUTE_PATH, ROUTE_PATH_LABEL } from '@/shared/consts/route';
import { BoxContainer } from '@/shared/ui/BoxContainer';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@package/ui';

export function WebNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (item: 'TRANSACTION' | 'APART') => {
    router.push(ROUTE_PATH[item]);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <BoxContainer>
        <div className="flex items-center justify-between">
          <Link
            href={ROUTE_PATH.TRANSACTION}
            className="flex items-center space-x-2 overflow-hidden transition-all duration-200"
          >
            <span className="flex h-[40px] overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.src} alt="집사요" className="h-full w-auto" />
            </span>
          </Link>

          {/* 네비게이션 */}
          <nav className="flex items-center">
            {['TRANSACTION' as const, 'APART' as const].map(item => (
              <Button
                key={item}
                size="xs"
                variant={
                  pathname.startsWith(ROUTE_PATH[item]) ? 'default' : 'ghost'
                }
                onClick={() => handleClick(item)}
              >
                {ROUTE_PATH_LABEL[item]}
              </Button>
            ))}
          </nav>
        </div>
      </BoxContainer>
    </header>
  );
}

import logo from '@/assets/logo.png';
import { ROUTE_PATH, ROUTE_PATH_LABEL } from '@/shared/consts/route';

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
    <div className="container mx-auto max-w-[640px] px-4">
      <div className="flex h-16 items-center justify-between">
        <Link
          href={ROUTE_PATH.TRANSACTION}
          className="flex items-center space-x-2 overflow-hidden transition-all duration-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src}
            alt="집사요"
            className="h-[96px] w-auto -translate-x-[6px] translate-y-[3px]"
          />
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center space-x-1">
          {['TRANSACTION' as const, 'APART' as const].map(item => (
            <Button
              key={item}
              size="sm"
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
    </div>
  );
}

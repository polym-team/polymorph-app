import logo from '@/assets/logo.png';
import { ROUTE_PATH, ROUTE_PATH_LABEL } from '@/shared/consts/route';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function WebNavigation() {
  const pathname = usePathname();

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
        <nav className="flex items-center space-x-2">
          {['TRANSACTION' as const, 'APART' as const].map(item => (
            <Link
              key={item}
              href={ROUTE_PATH[item]}
              className={getLinkClassName(ROUTE_PATH[item])}
            >
              {ROUTE_PATH_LABEL[item]}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

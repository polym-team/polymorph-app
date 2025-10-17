import { ROUTE_PATH, ROUTE_PATH_LABEL } from '@/shared/consts/route';

import { ArrowLeftIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

export function AppNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith(ROUTE_PATH.TRANSACTION))
      return ROUTE_PATH_LABEL.TRANSACTION;
    if (pathname.startsWith(ROUTE_PATH.APART_DETAIL))
      return ROUTE_PATH_LABEL.APART_DETAIL;
    if (pathname.startsWith(ROUTE_PATH.APART)) return ROUTE_PATH_LABEL.APART;

    return '';
  };

  const getShowsBackButton = () => {
    return pathname !== ROUTE_PATH.APART_DETAIL;
  };

  return (
    <div className="flex h-full items-center justify-between px-4">
      <div>
        {getShowsBackButton() && (
          <button onClick={() => router.back()}>
            <ArrowLeftIcon />
          </button>
        )}
      </div>
      <h1 className="text-xl font-bold">{getTitle()}</h1>
      <div />
    </div>
  );
}

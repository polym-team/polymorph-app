import { ROUTE_PATH } from '@/shared/consts/route';
import { closeWebview } from '@/shared/services/webviewService';

import { ChevronLeft } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

const APP_HEADER_SHOWS_PATH = [ROUTE_PATH.APART_DETAIL];

export function AppNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isShowAppHeader = APP_HEADER_SHOWS_PATH.some(path =>
    pathname.startsWith(path)
  );

  if (!isShowAppHeader) {
    return null;
  }

  const getTitle = () => {
    if (pathname.startsWith(ROUTE_PATH.APART_DETAIL)) {
      const apartName = searchParams.get('apartName');
      return apartName || '아파트 상세';
    }

    return '';
  };

  const handleBack = () => {
    closeWebview();
  };

  return (
    <header className="flex items-center justify-center pt-3.5">
      <button
        onClick={handleBack}
        className="absolute left-1 flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 active:bg-gray-200"
        aria-label="뒤로가기"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>
      <h1 className="text-lg font-semibold">{getTitle()}</h1>
      <div className="absolute right-4 h-10 w-10" />
    </header>
  );
}

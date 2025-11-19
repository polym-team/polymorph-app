import { ROUTE_PATH } from '@/shared/consts/route';
import { closeWebview } from '@/shared/services/webviewService';

import { ChevronLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';

const APP_HEADER_SHOWS_PATH = [ROUTE_PATH.APART_DETAIL];

export function AppNavigation() {
  const pathname = usePathname();

  const isShowAppHeader = APP_HEADER_SHOWS_PATH.some(path =>
    pathname.startsWith(path)
  );

  if (!isShowAppHeader) {
    return null;
  }

  const handleBack = () => {
    closeWebview();
  };

  return (
    <header className="flex w-full items-center justify-start bg-white py-2">
      <button
        onClick={handleBack}
        className="flex h-8 w-8 translate-x-[2px] items-center justify-center rounded-full transition-all active:scale-95 active:bg-gray-100"
        aria-label="뒤로가기"
      >
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>
    </header>
  );
}

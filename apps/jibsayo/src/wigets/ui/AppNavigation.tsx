import { closeWebview } from '@/shared/services/webviewService';
import { BoxContainer } from '@/shared/ui/BoxContainer';

import { ChevronLeft } from 'lucide-react';

interface AppNavigationProps {
  title?: string;
  showBackButton?: boolean;
}

export function AppNavigation({ title, showBackButton }: AppNavigationProps) {
  if (!title && !showBackButton) {
    return null;
  }

  const handleBackButtonClick = () => {
    closeWebview();
  };

  return (
    <header className="w-full bg-white">
      <BoxContainer>
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={handleBackButtonClick}
              className="flex h-8 w-8 -translate-x-2.5 items-center justify-center rounded-full transition-all active:scale-95 active:bg-gray-100"
              aria-label="뒤로가기"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
          )}
          {title && (
            <h1 className="translate-y-[1px] text-lg font-semibold">{title}</h1>
          )}
        </div>
      </BoxContainer>
    </header>
  );
}

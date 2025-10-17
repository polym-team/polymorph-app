'use client';

import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { AppNavigation } from './AppNavigation';
import { WebNavigation } from './WebNavigation';

export function Header() {
  const isInApp = useGlobalConfigStore(state => state.isInApp);

  return (
    <header className="sticky top-0 z-50 h-[56px] w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {isInApp ? <AppNavigation /> : <WebNavigation />}
    </header>
  );
}

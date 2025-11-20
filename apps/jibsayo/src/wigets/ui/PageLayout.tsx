'use client';

import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { cn } from '@package/utils';

import { AppNavigation } from './AppNavigation';
import { Main } from './Main';
import { WebNavigation } from './WebNavigation';

interface PageLayoutProps {
  title?: string;
  bgColor?: 'white' | 'gray';
  showBackButton?: boolean;
  children: React.ReactNode;
}

export function PageLayout({
  title,
  bgColor = 'white',
  showBackButton = false,
  children,
}: PageLayoutProps) {
  const isInApp = useGlobalConfigStore(state => state.isInApp);

  return (
    <section
      className={cn(
        'flex min-h-dvh flex-col items-center',
        bgColor === 'gray' ? 'bg-gray-50' : 'bg-white'
      )}
    >
      {isInApp ? (
        <AppNavigation title={title} showBackButton={showBackButton} />
      ) : (
        <WebNavigation />
      )}
      <Main>{children}</Main>
    </section>
  );
}

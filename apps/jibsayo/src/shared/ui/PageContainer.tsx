'use client';

import { cn } from '@package/utils';

interface PageContainerProps {
  className?: string;
  bgColor?: 'white';
  children: React.ReactNode;
}

export function PageContainer({
  className,
  bgColor,
  children,
}: PageContainerProps) {
  return (
    <section
      className={cn(
        'flex w-full justify-center lg:bg-transparent',
        bgColor === 'white' && 'bg-white'
      )}
    >
      <div
        className={cn(
          'w-full max-w-screen-md p-3 lg:max-w-screen-lg',
          className
        )}
      >
        <div
          className={cn(
            'lg:p-1',
            bgColor === 'white' &&
              'lg:rounded lg:border lg:border-gray-100 lg:bg-white lg:p-5'
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

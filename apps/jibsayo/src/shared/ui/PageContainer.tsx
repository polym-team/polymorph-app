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
        'flex w-full justify-center',
        bgColor === 'white' && 'bg-white lg:shadow-sm'
      )}
    >
      <div
        className={cn(
          'w-full max-w-screen-md p-3 lg:max-w-screen-lg',
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}

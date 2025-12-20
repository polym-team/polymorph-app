'use client';

import { cn } from '@package/utils';

interface PageContainerProps {
  className?: string;
  bgColor?: 'white' | 'gray';
  children: React.ReactNode;
}

export function PageContainer({ className, children }: PageContainerProps) {
  return (
    <section
      className={cn(
        '-mx-3 border-gray-100 bg-white p-3 md:-mx-0 md:rounded md:border md:p-5',
        className
      )}
    >
      {children}
    </section>
  );
}

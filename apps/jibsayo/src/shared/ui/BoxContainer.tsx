'use client';

import { cn } from '@package/utils';

interface BoxContainerProps {
  className?: string;
  bgColor?: 'white';
  children: React.ReactNode;
}

export function BoxContainer({
  className,
  bgColor,
  children,
}: BoxContainerProps) {
  return (
    <div
      className={cn(
        'flex w-full justify-center',
        bgColor === 'white' && 'bg-white'
      )}
    >
      <div className={cn('w-full max-w-screen-md p-3', className)}>
        {children}
      </div>
    </div>
  );
}

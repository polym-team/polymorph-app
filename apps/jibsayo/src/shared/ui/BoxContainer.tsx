'use client';

import { cn } from '@package/utils';

interface BoxContainerProps {
  bgColor?: 'white';
  children: React.ReactNode;
}

export function BoxContainer({ bgColor, children }: BoxContainerProps) {
  return (
    <div
      className={cn(
        'flex w-full justify-center',
        bgColor === 'white' && 'bg-white'
      )}
    >
      <div className="w-full max-w-screen-md p-3">{children}</div>
    </div>
  );
}

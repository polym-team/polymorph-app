import { cn } from '@package/utils';

interface HorizontalScrollContainerProps {
  className?: string;
  children: React.ReactNode;
}

export function HorizontalScrollContainer({
  className,
  children,
}: HorizontalScrollContainerProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          'scrollbar-hide flex overflow-x-auto overflow-y-hidden pr-8',
          className
        )}
      >
        {children}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
}

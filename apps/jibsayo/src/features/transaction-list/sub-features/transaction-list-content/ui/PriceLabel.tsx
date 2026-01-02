import { cn } from '@package/utils';

interface PriceLabelProps {
  className?: string;
  children: React.ReactNode;
}

export function PriceLabel({ className, children }: PriceLabelProps) {
  return (
    <span
      className={cn(
        'rounded-[4px] px-[5px] pb-[1px] pt-[2px] text-xs',
        className
      )}
    >
      {children}
    </span>
  );
}

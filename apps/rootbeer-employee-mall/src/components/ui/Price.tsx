import { cn } from '@package/utils';
import { formatNumber } from '@/lib/format';

type Size = 'sm' | 'md' | 'lg';

const SALE_SIZE: Record<Size, string> = {
  sm: 'text-[15px]',
  md: 'text-lg',
  lg: 'text-2xl',
};
const ORIGIN_SIZE: Record<Size, string> = {
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
};

interface PriceProps {
  sale: number;
  origin?: number | null;
  size?: Size;
  className?: string;
}

/** 판매가 + (선택) 원가 취소선. 숫자는 tabular-nums 정렬 */
export function Price({ sale, origin, size = 'sm', className }: PriceProps) {
  const showOrigin = origin != null && origin !== sale;
  return (
    <span className={cn('inline-flex items-baseline gap-1.5 tnum', className)}>
      <span className={cn('font-bold text-ink-900', SALE_SIZE[size])}>
        {formatNumber(sale)}
        <span className="ml-0.5 text-[0.7em] font-medium text-ink-400">원</span>
      </span>
      {showOrigin && (
        <span className={cn('text-ink-400 line-through', ORIGIN_SIZE[size])}>
          {formatNumber(origin!)}
        </span>
      )}
    </span>
  );
}

import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@package/utils';

import { Sorting } from '../models/types';

interface TransactionSortingProps {
  sorting: Sorting;
  onSortingChange: (sorting: Sorting) => void;
}
export function TransactionSorting({
  sorting,
  onSortingChange,
}: TransactionSortingProps) {
  return (
    <div className="flex gap-x-2">
      <button
        type="button"
        className={cn(
          'flex items-center text-sm opacity-40',
          sorting.id === 'tradeDate' && 'opacity-100'
        )}
        onClick={() =>
          onSortingChange({ id: 'tradeDate', desc: !sorting.desc })
        }
      >
        최신순{' '}
        {sorting.id === 'tradeDate' &&
          (sorting.desc ? <ChevronDown size={16} /> : <ChevronUp size={16} />)}
      </button>
      <span className="text-gray-400">·</span>
      <button
        type="button"
        className={cn(
          'flex items-center text-sm opacity-40',
          sorting.id === 'tradeAmount' && 'opacity-100'
        )}
        onClick={() =>
          onSortingChange({ id: 'tradeAmount', desc: !sorting.desc })
        }
      >
        가격순{' '}
        {sorting.id === 'tradeAmount' &&
          (sorting.desc ? <ChevronDown size={16} /> : <ChevronUp size={16} />)}
      </button>
    </div>
  );
}

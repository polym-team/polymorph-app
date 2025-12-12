import { SortingState } from '@/features/transaction-list/types';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@package/utils';

interface SortingProps {
  isLoading: boolean;
  sorting: SortingState;
}

export function Sorting({ isLoading, sorting }: SortingProps) {
  if (isLoading) {
    return <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />;
  }

  return (
    <div className="flex gap-x-2">
      <button
        type="button"
        className={cn(
          'flex items-center text-sm opacity-40',
          sorting.state.id === 'dealDate' && 'opacity-100'
        )}
        onClick={() =>
          sorting.update({ id: 'dealDate', desc: !sorting.state.desc })
        }
      >
        최신순{' '}
        {sorting.state.id === 'dealDate' &&
          (sorting.state.desc ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronUp size={16} />
          ))}
      </button>
      <span className="text-gray-400">·</span>
      <button
        type="button"
        className={cn(
          'flex items-center text-sm opacity-40',
          sorting.state.id === 'dealAmount' && 'opacity-100'
        )}
        onClick={() =>
          sorting.update({ id: 'dealAmount', desc: !sorting.state.desc })
        }
      >
        가격순{' '}
        {sorting.state.id === 'dealAmount' &&
          (sorting.state.desc ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronUp size={16} />
          ))}
      </button>
    </div>
  );
}

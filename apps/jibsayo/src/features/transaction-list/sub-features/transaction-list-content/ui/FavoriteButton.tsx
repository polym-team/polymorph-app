import { Star } from 'lucide-react';

import { cn } from '@package/utils';

interface FavoriteButtonProps {
  active: boolean;
  onClick: () => void;
}

export function FavoriteButton({ active, onClick }: FavoriteButtonProps) {
  return (
    <button
      className="flex items-center"
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
    >
      <Star
        className={cn(
          'h-[16px] w-[16px]',
          active && 'fill-yellow-400 text-yellow-400',
          !active && 'fill-gray-300 text-gray-300'
        )}
      />
    </button>
  );
}

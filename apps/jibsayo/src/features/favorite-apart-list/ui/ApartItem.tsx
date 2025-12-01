import { ChevronRight, Star } from 'lucide-react';

import { FavoriteApartItemViewModel } from '../types';

interface ApartItemProps {
  item: FavoriteApartItemViewModel;
  onToggle: () => void;
  onClick: () => void;
}

export function ApartItem({ item, onToggle, onClick }: ApartItemProps) {
  return (
    <div
      key={item.apartId}
      className="flex items-center justify-between border-b border-gray-100 bg-white p-3 transition-colors duration-200 last:border-b-0 active:bg-gray-100 lg:cursor-pointer lg:hover:bg-gray-100"
      onClick={() => onClick()}
    >
      <span className="leading-1 flex items-center gap-x-1">
        {item.apartName}{' '}
        <ChevronRight
          size={18}
          className="translate-y-[-0.5px] text-gray-300"
        />
      </span>
      <button
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          onToggle();
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full active:bg-gray-200"
      >
        <Star
          size={16}
          className={
            item.isFavorite
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-300 text-gray-300'
          }
        />
      </button>
    </div>
  );
}

import { Star } from 'lucide-react';
import { useCallback } from 'react';

import { cn } from '@package/utils';

import { useAddFavoriteApartHandler } from '../hooks/useAddFavoriteApartHandler';
import { useRemoveFavoriteApartHandler } from '../hooks/useRemoveFavoriteApartHandler';
import { FavoriteApartItem } from '../models/types';

interface FavoriteApartToggleButtonProps {
  isFavorite: boolean;
  size: 'base' | 'lg';
  data: {
    regionCode: FavoriteApartItem['regionCode'];
    apartName: FavoriteApartItem['apartName'];
    address: FavoriteApartItem['address'];
  };
}

export function FavoriteApartToggleButton({
  isFavorite,
  size,
  data,
}: FavoriteApartToggleButtonProps) {
  const addFavoriteApart = useAddFavoriteApartHandler();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (isFavorite) {
        removeFavoriteApart({ ...data, apartId: data.apartName });
      } else {
        addFavoriteApart({ ...data, apartId: data.apartName });
      }
    },
    [isFavorite, data, removeFavoriteApart, addFavoriteApart]
  );

  return (
    <button type="button" onClick={handleClick}>
      <Star
        className={cn(
          size === 'base' && 'h-[14px] w-[14px]',
          isFavorite && 'fill-yellow-400 text-yellow-400',
          !isFavorite && 'fill-gray-300 text-gray-300'
        )}
      />
    </button>
  );
}

import { getRegionNameWithRegionCode } from '@/entities/region';
import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';

import { X } from 'lucide-react';

import { Button } from '@package/ui';

interface FavoriteRegionListProps {
  favoriteRegionList: string[];
  onRemove: (regionCode: string) => void;
  onSelect: (regionCode: string) => void;
}

export function FavoriteRegionList({
  favoriteRegionList,
  onRemove,
  onSelect,
}: FavoriteRegionListProps) {
  return (
    <HorizontalScrollContainer>
      <div className="flex gap-x-1">
        {favoriteRegionList.map(regionCode => (
          <Button
            key={regionCode}
            size="xs"
            variant="primary-light"
            rounded
            className="pr-2"
            onClick={() => onSelect(regionCode)}
          >
            <span>{getRegionNameWithRegionCode(regionCode)}</span>
            <span
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                onRemove(regionCode);
              }}
            >
              <X className="h-4 w-4 translate-y-[-0.5px]" />
            </span>
          </Button>
        ))}
      </div>
    </HorizontalScrollContainer>
  );
}

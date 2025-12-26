import { XIcon } from 'lucide-react';

import { Button } from '@package/ui';

interface FilterButtonProps {
  children: React.ReactNode;
  onRemove: () => void;
}

export function FilterButton({ children, onRemove }: FilterButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <Button
      size="sm"
      variant="primary"
      rounded
      className="pr-2"
      onClick={handleClick}
    >
      {children}
      <span className="-translate-y-[0.5px] bg-transparent">
        <XIcon className="h-4 w-4" />
      </span>
    </Button>
  );
}

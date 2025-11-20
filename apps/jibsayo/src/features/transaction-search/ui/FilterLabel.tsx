import { XIcon } from 'lucide-react';

import { Button } from '@package/ui';

interface FilterLabelProps {
  children: React.ReactNode;
  onRemove: () => void;
}

export function FilterLabel({ children, onRemove }: FilterLabelProps) {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <Button
      size="xs"
      variant="primary-light"
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

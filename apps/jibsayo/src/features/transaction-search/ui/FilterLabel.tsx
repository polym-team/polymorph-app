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
    <Button size="xs" variant="primary-outline" className="pr-1">
      {children}
      <span className="bg-transparent" onClick={handleClick}>
        <XIcon className="h-4 w-4" />
      </span>
    </Button>
  );
}

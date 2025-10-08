import { XIcon } from 'lucide-react';

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
    <span className="bg-primary text-primary-foreground flex items-center gap-1 whitespace-nowrap rounded-sm px-2.5 py-1.5 text-xs">
      {children}
      <span className="bg-transparent" onClick={handleClick}>
        <XIcon className="h-4 w-4" />
      </span>
    </span>
  );
}

import { Typography } from '@package/ui';
import { cn } from '@package/utils';

interface SimpleTableTextProps {
  className?: string;
  children: React.ReactNode;
}

export function SimpleTableText({ children, className }: SimpleTableTextProps) {
  return (
    <Typography variant="p" className={cn('p-0 leading-5', className)}>
      {children}
    </Typography>
  );
}

import { ReactNode } from 'react';

import { Card } from '@package/ui';
import { cn } from '@package/utils';

interface CardItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}
function CardItem({ children, className, onClick }: CardItemProps) {
  return (
    <Card className={cn('p-3.5', className)} onClick={onClick}>
      {children}
    </Card>
  );
}

interface CardListProps {
  children: ReactNode;
}
export function CardList({ children }: CardListProps) {
  return <div className="flex flex-col gap-y-2 bg-gray-50">{children}</div>;
}

CardList.Item = CardItem;

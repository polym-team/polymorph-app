import { ReactNode } from 'react';

import { Card } from '@package/ui';

interface CardItemProps {
  children: ReactNode;
  onClick?: () => void;
}
function CardItem({ children, onClick }: CardItemProps) {
  return (
    <Card className="p-3.5" onClick={onClick}>
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

import { PageContainer } from '@/shared/ui/PageContainer';

import { ReactNode } from 'react';

interface ContainerProps {
  title?: string;
  children: ReactNode;
}

export function Container({ title, children }: ContainerProps) {
  return (
    <PageContainer bgColor="white" className="flex flex-col gap-y-3 py-4">
      {title && (
        <span className="text-sm text-gray-500 lg:text-base">{title}</span>
      )}
      <div>{children}</div>
    </PageContainer>
  );
}

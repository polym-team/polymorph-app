import { PageContainer } from '@/shared/ui/PageContainer';

import { ReactNode } from 'react';

interface ContainerProps {
  title?: string;
  isLoading?: boolean;
  children: ReactNode;
}

export function Container({
  title,
  isLoading = false,
  children,
}: ContainerProps) {
  return (
    <PageContainer bgColor="white" className="flex flex-col gap-y-3 py-4">
      {isLoading && title && (
        <span className="h-5 w-20 animate-pulse rounded bg-gray-200 lg:h-6" />
      )}
      {!isLoading && title && (
        <span className="text-sm text-gray-500 lg:text-base">{title}</span>
      )}
      <div>{children}</div>
    </PageContainer>
  );
}

import { PageContainer } from '@/shared/ui/PageContainer';

import { CircleAlert } from 'lucide-react';

export function EmptyInfo() {
  return (
    <PageContainer className="flex flex-col items-center gap-y-3 lg:mt-5 lg:py-5">
      <CircleAlert size={24} className="text-gray-500" />
      <span className="text-sm text-gray-500 lg:text-base">
        아파트 정보를 조회하지 못했어요
      </span>
    </PageContainer>
  );
}

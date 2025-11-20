import { ApartList } from '@/features/apart-list';
import { PageLayout } from '@/wigets/ui/PageLayout';

export default function ApartPage() {
  return (
    <PageLayout bgColor="gray">
      <ApartList />
    </PageLayout>
  );
}

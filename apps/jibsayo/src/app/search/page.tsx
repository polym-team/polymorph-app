import { ApartSearch } from '@/features/apart-search/ApartSearch';
import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

export default function SearchPage() {
  return (
    <PageLayout bgColor="gray">
      <ApartSearch />
    </PageLayout>
  );
}

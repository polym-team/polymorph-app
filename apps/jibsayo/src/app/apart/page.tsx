import { FavoriteApartList } from '@/features/favorite-apart-list';
import { PageLayout } from '@/wigets/ui/page-layout/PageLayout';

import { WebviewInitializer } from './WebviewInitializer';

export default function ApartPage() {
  return (
    <PageLayout bgColor="gray">
      <WebviewInitializer />
      <FavoriteApartList />
    </PageLayout>
  );
}

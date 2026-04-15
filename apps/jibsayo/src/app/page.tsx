import { Landing } from '@/features/landing';
import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

export default function HomePage() {
  return (
    <PageLayout bgColor="gray">
      <Landing />
    </PageLayout>
  );
}

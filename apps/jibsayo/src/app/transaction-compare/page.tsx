import { TransactionCompare } from '@/features/transaction-compare';
import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

export default function TransactionComparePage() {
  return (
    <PageLayout bgColor="gray">
      <TransactionCompare />
    </PageLayout>
  );
}

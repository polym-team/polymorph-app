import { ROUTE_PATH } from '@/shared/consts/route';

import { useRouter } from 'next/navigation';

import { Button, Card } from '@package/ui';

export function EmptyApartList() {
  const router = useRouter();

  const handleClickTransactionView = () => {
    router.push(ROUTE_PATH.TRANSACTION);
  };

  return (
    <Card className="flex flex-col items-center justify-center gap-y-3 py-10">
      저장된 아파트가 없어요
      <Button variant="outline" onClick={handleClickTransactionView}>
        실거래가 보기
      </Button>
    </Card>
  );
}

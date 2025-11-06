import { ROUTE_PATH } from '@/shared/consts/route';
import { switchTab } from '@/shared/services/webviewService';

import { useRouter } from 'next/navigation';

import { Button, Card } from '@package/ui';

export function EmptyApartList() {
  const router = useRouter();

  const handleClickTransactionView = () => {
    // switchTab 인터페이스가 존재하면 탭 전환만 수행하고 router.push는 실행하지 않음
    const tabSwitched = switchTab('index');
    if (!tabSwitched) {
      router.push(ROUTE_PATH.TRANSACTION);
    }
  };

  return (
    <Card className="flex flex-col items-center justify-center gap-y-3 py-8">
      저장된 아파트가 없어요
      <Button variant="outline" size="sm" onClick={handleClickTransactionView}>
        실거래가 보기
      </Button>
    </Card>
  );
}

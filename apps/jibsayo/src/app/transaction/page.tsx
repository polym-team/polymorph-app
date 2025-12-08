import { ROUTE_PATH } from '@/shared/consts/route';

import { redirect } from 'next/navigation';

export default function Transaction() {
  // TODO: 하위 호환성 보장을 위한 redirect, 추후 제거 필요
  redirect(ROUTE_PATH.TRANSACTIONS);

  return null;
}

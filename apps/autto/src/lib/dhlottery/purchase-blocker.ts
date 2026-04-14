import { getKSTDate } from './round';

/**
 * 토요일 11:00 KST ~ 토요일 23:59:59 KST 구매 차단
 */
export function isPurchaseBlocked(): boolean {
  const kst = getKSTDate();
  const day = kst.getDay(); // 6 = Saturday
  const hour = kst.getHours();
  return day === 6 && hour >= 11;
}

export function getPurchaseBlockMessage(): string {
  return '토요일 오전 11시부터 자정까지는 구매할 수 없습니다. (추첨 시간)';
}

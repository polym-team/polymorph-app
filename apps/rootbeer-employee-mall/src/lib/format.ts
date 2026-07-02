/** 가격·날짜 포맷 공용 유틸 */

/** 12900 → "12,900" */
export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

/** 12900 → "12,900원" */
export function formatPrice(value: number): string {
  return `${formatNumber(value)}원`;
}

/** "2026-07-02" → "2026년 7월 2일" */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** "2026-07-02" → "7월 2일" */
export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
}

/** "2026-07-02T14:30" → "7월 2일 오후 02:30" */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * YYYYMMDD 형식의 날짜 문자열을 받아 하루 전 날짜를 같은 형식으로 반환
 * @param dateStr YYYYMMDD 형식의 날짜 (예: '20251120')
 * @returns 하루 전 날짜 (예: '20251119')
 */
export function getPreviousDate(dateStr: string): string {
  // YYYYMMDD 형식 파싱
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10);
  const day = parseInt(dateStr.substring(6, 8), 10);

  // Date 객체 생성 (월은 0부터 시작하므로 -1)
  const date = new Date(year, month - 1, day);

  // 하루 전으로 설정
  date.setDate(date.getDate() - 1);

  // YYYYMMDD 형식으로 변환
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');

  return `${newYear}${newMonth}${newDay}`;
}

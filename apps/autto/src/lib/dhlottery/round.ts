/**
 * 로또645 현재 판매 중인 회차를 계산
 * 2002년 12월 7일(토요일)부터 매주 토요일 추첨
 */
export function getCurrentRound(): number {
  const firstRoundDate = new Date(2002, 11, 7); // 2002-12-07
  const now = getKSTDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
  const daysUntilSaturday = (6 - dayOfWeek) % 7;
  const thisSaturday = new Date(today);
  thisSaturday.setDate(today.getDate() + daysUntilSaturday);

  const diffMs = thisSaturday.getTime() - firstRoundDate.getTime();
  const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeksPassed = Math.floor(daysDiff / 7);

  return 1 + weeksPassed;
}

/**
 * 추첨일과 당첨금 지급 기한 계산
 */
export function calculateDrawDates(): { drawDate: Date; payLimitDate: Date } {
  const now = getKSTDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek) % 7;
  const drawDate = new Date(today);
  drawDate.setDate(today.getDate() + daysUntilSaturday);

  const payLimitDate = new Date(drawDate);
  payLimitDate.setFullYear(payLimitDate.getFullYear() + 1);

  return { drawDate, payLimitDate };
}

export function getKSTDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 9 * 60 * 60000);
}

export function formatDate(date: Date, format: 'slash' | 'dash' | 'compact' = 'slash'): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  if (format === 'slash') return `${y}/${m}/${d}`;
  if (format === 'dash') return `${y}-${m}/${d}`;
  return `${y}${m}${d}`;
}

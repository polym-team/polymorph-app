/**
 * 로또 번호를 동행복권 공식 색으로 시각화 (도메인 고정색, 테마 무관).
 * 1–10 노랑 / 11–20 파랑 / 21–30 빨강 / 31–40 회색 / 41–45 초록.
 */
function ballColor(n: number): string {
  if (n <= 10) return '#fbc400';
  if (n <= 20) return '#69c8f2';
  if (n <= 30) return '#ff7272';
  if (n <= 40) return '#aaaaaa';
  return '#b0d840';
}

function parseNumbers(input: string | number[]): number[] {
  if (Array.isArray(input)) return input;
  return String(input)
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n));
}

export function LottoBalls({
  numbers,
  size = 'md',
}: {
  numbers: string | number[];
  size?: 'sm' | 'md';
}) {
  const arr = parseNumbers(numbers);
  if (arr.length === 0) return null;
  const dim = size === 'sm' ? 'h-6 w-6 text-[11px]' : 'h-7 w-7 text-xs';
  return (
    <span className="inline-flex flex-wrap gap-1">
      {arr.map((n, i) => (
        <span
          key={i}
          className={`inline-grid place-items-center rounded-full font-bold tabular-nums text-white shadow-[inset_0_-2px_3px_rgba(0,0,0,0.15)] ${dim}`}
          style={{ background: ballColor(n) }}
        >
          {n}
        </span>
      ))}
    </span>
  );
}

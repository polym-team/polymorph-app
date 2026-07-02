import { cn } from '@package/utils';

/** input / select / textarea 공통 스타일 (기존 `border rounded px-3 py-1.5` 통일) */
export const fieldClass =
  'w-full bg-paper-card border border-line rounded px-3 py-2 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-clay-500/25 focus:border-clay-500/40 transition-all';

export function field(className?: string) {
  return cn(fieldClass, className);
}

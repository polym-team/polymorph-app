import { cn } from '@package/utils';
import { TONE_CLASS, type StatusMeta } from '@/lib/status';

/** status.ts 의 StatusMeta({ label, tone })를 받아 소프트 뱃지로 렌더 */
export function StatusBadge({ status, className }: { status: StatusMeta | undefined; className?: string }) {
  if (!status) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        TONE_CLASS[status.tone],
        className,
      )}
    >
      {status.label}
    </span>
  );
}

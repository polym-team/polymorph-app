import { cn } from '@package/utils';

/** 흰 표면 + 헤어라인 보더 + soft 그림자 표준 카드 컨테이너 */
export function SectionCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-paper-card border border-line rounded-lg shadow-soft', className)}
      {...props}
    />
  );
}

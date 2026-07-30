/** 페이지 상단 마스트헤드 — 세리프 제목 + (선택) 세리프 이탤릭 eyebrow + 보조설명 + 우측 액션 */
export function PageHeader({
  title,
  eyebrow,
  subtitle,
  action,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 mt-1 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 font-serif text-[14px] text-clay-500">{eyebrow}</p>
        )}
        <h1 className="font-serif text-[26px] tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

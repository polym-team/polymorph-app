/** 목록이 비었을 때의 중앙 정렬 안내 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-16 text-center">
      <p className="mb-1 text-base text-ink-600">{title}</p>
      {description && <p className="text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

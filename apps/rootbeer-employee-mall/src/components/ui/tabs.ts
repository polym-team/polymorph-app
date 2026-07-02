import { cn } from '@package/utils';

/** 하단 보더 스타일 탭 아이템 (admin layout / rounds[id] 공용) */
export function tabItemClass(active: boolean) {
  return cn(
    'px-3 py-2 text-sm -mb-px border-b-2 transition-colors',
    active
      ? 'border-ink-900 text-ink-900 font-medium'
      : 'border-transparent text-ink-400 hover:text-ink-600',
  );
}

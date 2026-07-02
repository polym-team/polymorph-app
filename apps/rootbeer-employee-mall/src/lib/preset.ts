/** 필터 프리셋 저장 (디바운스 500ms). 홈·검색 오버레이 공용. */
let timer: ReturnType<typeof setTimeout> | null = null;

export function savePreset(store: string, brands: string[], keyword: string) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    fetch('/api/users/filter-preset', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store, brands, keyword }),
    }).catch(() => {});
  }, 500);
}

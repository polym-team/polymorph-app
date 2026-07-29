// SiteProfile 도메인 매칭 · 선택자 파싱 유틸 (서버/클라 공용, 순수 함수)

/** 호스트가 단일 패턴에 매칭되는지. `*.` 접두는 서브도메인 suffix 매칭(베어 도메인 포함). */
export function hostMatchesPattern(host: string, pattern: string): boolean {
  const h = host.toLowerCase().trim();
  const p = pattern.toLowerCase().trim();
  if (!h || !p) return false;
  if (p.startsWith('*.')) {
    const base = p.slice(2); // "*.daum.net" → "daum.net"
    return h === base || h.endsWith(`.${base}`);
  }
  return h === p;
}

/** comma-sep 패턴 문자열 중 하나라도 매칭되면 true. */
export function hostMatchesAny(host: string, domainPatterns: string): boolean {
  return domainPatterns
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .some((p) => hostMatchesPattern(host, p));
}

/** newline-sep 선택자 문자열 → 배열(빈 줄 제거). */
export function parseSelectors(targetSelectors: string): string[] {
  return targetSelectors
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * redirectUri/returnUrl 검증 헬퍼
 * - 등록된 URL과 origin + path가 일치하면 허용
 * - query, fragment는 무시 (앱이 returnTo 등을 자유롭게 붙일 수 있도록)
 */
function normalize(uri: string): string | null {
  try {
    const u = new URL(uri);
    return `${u.origin}${u.pathname}`;
  } catch {
    return null;
  }
}

export function isAllowedRedirectUri(uri: string, allowedRedirectUris: string): boolean {
  const target = normalize(uri);
  if (!target) return false;

  const allowed = allowedRedirectUris
    .split(',')
    .map(s => normalize(s.trim()))
    .filter((v): v is string => v !== null);

  return allowed.includes(target);
}

/**
 * returnUrl 검증 (계정 관리/로그아웃 후 돌아갈 URL)
 * 등록된 redirectUri의 origin과 일치하면 허용 (path 자유)
 */
export function isAllowedReturnUrl(url: string, allowedRedirectUris: string): boolean {
  let targetOrigin: string;
  try {
    targetOrigin = new URL(url).origin;
  } catch {
    return false;
  }

  const allowedOrigins = new Set(
    allowedRedirectUris
      .split(',')
      .map(s => {
        try {
          return new URL(s.trim()).origin;
        } catch {
          return null;
        }
      })
      .filter((v): v is string => v !== null),
  );

  return allowedOrigins.has(targetOrigin);
}

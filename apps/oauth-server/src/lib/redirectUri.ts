/**
 * redirectUri/returnUrl 검증 헬퍼
 * - 등록된 URL과 origin + path가 일치하면 허용
 * - query, fragment는 무시 (앱이 returnTo 등을 자유롭게 붙일 수 있도록)
 * - 루프백(127.0.0.1/localhost/[::1])끼리는 포트를 무시 (RFC 8252 §7.3)
 */

/**
 * 루프백 IP 리다이렉트 여부 (RFC 8252 §7.3).
 * native/CLI 클라이언트는 http://127.0.0.1:<random>/callback 처럼 임의 포트를 쓰므로
 * 루프백 호스트끼리는 포트를 무시하고 pathname 만 매칭한다.
 */
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '[::1]', 'localhost']);

function isLoopback(u: URL): boolean {
  return u.protocol === 'http:' && LOOPBACK_HOSTS.has(u.hostname);
}

export function isAllowedRedirectUri(uri: string, allowedRedirectUris: string): boolean {
  let target: URL;
  try {
    target = new URL(uri);
  } catch {
    return false;
  }
  const targetNorm = `${target.origin}${target.pathname}`;

  return allowedRedirectUris
    .split(',')
    .map(s => s.trim())
    .some(entry => {
      let allowed: URL;
      try {
        allowed = new URL(entry);
      } catch {
        return false;
      }
      if (allowed.pathname !== target.pathname) return false;
      // 루프백끼리는 포트·호스트 표기 차이를 무시 (127.0.0.1 등록 → 임의 포트 허용)
      if (isLoopback(allowed) && isLoopback(target)) return true;
      return `${allowed.origin}${allowed.pathname}` === targetNorm;
    });
}

/**
 * authorize 에 쓰인 redirect_uri 와 token 교환 시 보낸 redirect_uri 가 같은지 비교.
 * 루프백(RFC 8252 §7.3)은 native 앱이 매 실행 임의 포트를 쓰므로 포트를 무시하고 pathname 만 비교한다.
 * (authorize 단계의 허용 검증과 동일한 규칙 — token 교환만 엄격 문자열 비교하면 포트가 어긋날 때 실패.)
 */
export function redirectUrisEqual(a: string, b: string): boolean {
  let ua: URL;
  let ub: URL;
  try {
    ua = new URL(a);
    ub = new URL(b);
  } catch {
    return false;
  }
  if (ua.pathname !== ub.pathname) return false;
  if (isLoopback(ua) && isLoopback(ub)) return true;
  return `${ua.origin}${ua.pathname}` === `${ub.origin}${ub.pathname}`;
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

/** oauth-server 통합 상수 */

export const CLIENT_ID = 'myflighthistory';

/** 브라우저에서 로그인/연결 리다이렉트에 쓰는 공개 URL */
export const OAUTH_SERVER_URL =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';

/**
 * 서버사이드에서 브로커 API 호출에 쓰는 URL. 공개 URL 과 동일하지만, 클러스터 내부
 * 서비스 주소를 쓰고 싶으면 OAUTH_SERVER_INTERNAL_URL 로 오버라이드.
 */
export const OAUTH_SERVER_INTERNAL_URL =
  process.env.OAUTH_SERVER_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ??
  'https://oauth.polymorph.co.kr';

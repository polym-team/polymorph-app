/**
 * JWT 토큰 페이로드
 * iss: 발행자 (oauth-server)
 * sub: 유저 고유 ID
 * exp: 만료 시간 (UNIX timestamp)
 * iat: 발급 시간 (UNIX timestamp)
 * email: 유저 대표 이메일 (카카오 단독 가입 시 더미 email일 수 있음)
 * name: 유저 이름
 * provider: 로그인 제공자 (google, kakao, ...)
 * clientId: 토큰을 요청한 클라이언트 앱 ID
 * linkedEmails: 이 유저에 연동된 모든 provider account의 실제 email 목록 (dedup, NULL 제외).
 *   자체 인증 앱(예: google 단일)이 oauth로 통합 마이그레이션할 때 기존 user를 매핑하는 데 사용.
 */
export interface TokenPayload {
  sub: string;
  email: string;
  name?: string;
  provider: string;
  clientId: string;
  linkedEmails?: string[];
  iss?: string;
  exp?: number;
  iat?: number;
}

export interface ValidateResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

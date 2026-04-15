/**
 * JWT 토큰 페이로드
 * iss: 발행자 (oauth-server)
 * sub: 유저 고유 ID
 * exp: 만료 시간 (UNIX timestamp)
 * iat: 발급 시간 (UNIX timestamp)
 * email: 유저 이메일
 * name: 유저 이름
 * provider: 로그인 제공자 (google, kakao, ...)
 * clientId: 토큰을 요청한 클라이언트 앱 ID
 */
export interface TokenPayload {
  sub: string;
  email: string;
  name?: string;
  provider: string;
  clientId: string;
  iss?: string;
  exp?: number;
  iat?: number;
}

export interface ValidateResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

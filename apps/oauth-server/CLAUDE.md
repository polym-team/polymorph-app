# oauth-server

Polymorph 모노레포의 **중앙 집중식 인증 서버**. 모든 앱이 자체 로그인/계정 관리 UI를 만들지 않고 이 서버로 위임한다.

- 운영 URL: `https://oauth.polymorph.co.kr`
- 로컬 포트: `3007`
- DB: 별도 `oauth` DB (User, Account, ClientApp)
- JWT: HS256 대칭키 (`OAUTH_JWT_SECRET`)

## 아키텍처 원칙

1. **각 앱은 자체 로그인/계정 관리 UI를 갖지 않는다.** 모두 oauth-server로 리다이렉트.
2. **각 앱은 JWT 검증만 한다.** `packages/shared-auth`의 `validateToken` / `authMiddleware` 사용.
3. **JWT는 HttpOnly 쿠키로 저장한다.** (클라이언트 JS 접근 차단)
4. **JWT는 내부 User ID(`sub`) 기반.** 카카오처럼 이메일 없는 provider도 동작.

## 통합 흐름 (다른 앱에서 이 서버 사용하기)

### 1. ClientApp 등록

`apps/oauth-server/prisma/seed.ts`에 앱 추가 후 `pnpm --filter oauth-server db:seed` 실행:

```ts
{
  clientId: 'my-app',
  name: '내 앱',
  allowedRedirectUris: [
    'http://localhost:3000/auth/callback',
    'https://my-app.polymorph.co.kr/auth/callback',
  ].join(','),
  accessTokenLifetime: 60 * 60 * 24 * 7, // 7일
}
```

### 2. 각 앱이 구현해야 할 것

- **`/auth/callback` 페이지**: URL fragment의 `#token=...`을 읽어서 `POST /api/auth/set-cookie`로 HttpOnly 쿠키 저장 후 홈으로 이동
- **`/api/auth/set-cookie`**: 토큰 받아서 HttpOnly 쿠키로 세팅 (shared-auth에서 쿠키명 `polymorph_auth` 사용)
- **middleware.ts**: `packages/shared-auth`의 `authMiddleware` 사용
- **로그인/계정/로그아웃 버튼**: 각각 아래 URL로 `window.location` 이동

### 3. 각 앱이 쓰는 oauth-server URL

| 용도 | URL |
|------|-----|
| 로그인 | `https://oauth.polymorph.co.kr/login?clientId={앱ID}&redirectUri={앱콜백}` |
| 계정 관리 | `https://oauth.polymorph.co.kr/account?clientId={앱ID}&returnUrl={앱홈}` |
| 로그아웃 | `https://oauth.polymorph.co.kr/logout?returnUrl={앱홈}` (로컬 쿠키는 앱에서 먼저 제거) |

### 4. 미들웨어 예시 (Silent SSO 권장)

```ts
// apps/my-app/middleware.ts
import { authMiddleware } from '@polymorph/shared-auth/middleware';

export default function middleware(req) {
  return authMiddleware(req, {
    clientId: 'my-app',
    onUnauthenticated: 'silent', // SSO 세션 있으면 자동 로그인, 없으면 비로그인 진행
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicons|favicon.ico|robots.txt|sitemap.xml|auth/callback).*)',
  ],
};
```

**`onUnauthenticated` 옵션:**
- `'silent'` (권장): oauth-server에 SSO 세션이 있으면 자동 로그인. 없으면 비로그인 진행. 한 번 실패하면 60초간 재시도 안 함 (무한 루프 방지)
- `'redirect'`: 무조건 oauth-server 로그인 페이지로 리다이렉트 (강제 로그인)
- `'continue'` (기본): 비로그인 상태로 그대로 진행

**검증 성공 시** 요청 헤더에 `x-user-id`, `x-user-email`, `x-user-name`, `x-user-provider` 주입됨. API에서 DB 조회 없이 헤더만 읽어 사용.

**Silent SSO 흐름:**
1. 사용자가 앱 페이지 진입 (쿠키 없음)
2. 미들웨어가 oauth-server `/api/silent-auth`로 자동 리다이렉트
3. oauth-server에 NextAuth 세션 있으면 → JWT 발급, 앱 callback으로 리다이렉트 → 쿠키 저장 → 원래 페이지 도달 (사용자는 클릭 없음, 페이지가 살짝 깜빡임만)
4. 세션 없으면 → 토큰 없이 callback으로 리다이렉트 → 비로그인 상태로 원래 페이지 도달

## 주요 설계 결정

- **카카오 이메일 없음 대응**: `{provider}_{id}@no-email.polymorph.co.kr` 가짜 이메일 생성. 세션은 이메일이 아닌 내부 User ID 기반이라 동작함.
- **자동 연동**: 같은 이메일 가진 User가 있으면 새 Account 자동 연결. 의도치 않은 연동이 싫으면 명시적 로그아웃 후 신규 가입 필요.
- **연동/병합 구분**:
  - **Linking**: 현재 계정에 새 provider 추가. 이미 다른 User에 연결된 provider면 거부.
  - **Merging**: 다른 User 자체를 현재 User로 흡수. 다른 User는 삭제됨. 이메일 다른 경우의 해결책.
- **쿠키 기반 의도 전달**: `LINKING_COOKIE`, `MERGING_COOKIE`를 임시로 세팅한 뒤 `signIn()` 호출. signIn 콜백에서 쿠키로 의도 판별.

## 주의사항

- **OAUTH_JWT_SECRET은 모든 앱이 공유한다.** 검증에 필요. k8s secret으로 배포.
- **소셜 Provider 콘솔에 콜백 URL 등록 필수**: `https://oauth.polymorph.co.kr/api/auth/callback/{google|kakao}` (로컬도 별도 등록)
- **신규 Provider 추가 시**: `src/lib/auth.ts`의 providers 배열에 추가 + env 환경변수 추가 + secret.yaml 반영
- **returnUrl 검증**: open redirect 방지 위해 ClientApp의 allowedRedirectUris origin과 매칭 필요 (미구현 시 추가 필요)

## redirectUri 매칭 정책

- **origin + path만 정확 매칭**, query/fragment는 자유 (`src/lib/redirectUri.ts` 참조)
- 앱은 `redirectUri=https://app/auth/callback?returnTo=/some/page` 같은 형태로 자유롭게 returnTo 전달 가능
- ClientApp 등록 시 `https://app/auth/callback`만 등록하면 됨 (query 변형들 다 등록 불필요)

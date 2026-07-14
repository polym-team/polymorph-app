# directfeedback-mcp OAuth 2.1 전환 계획

## 배경 / 문제

`directfeedback-mcp`(로컬 stdio MCP 서버)를 npm에 배포하려 한다. 현재 이 서버는
`OAUTH_JWT_SECRET`(oauth-server가 **모든 앱과 공유하는 HS256 마스터 서명키**)을 받아서
`index.mjs`의 `mintToken()`이 **클라이언트 측에서 직접 JWT를 서명·발급**한다.

이 방식은 배포에 부적합하다:

- 마스터키를 가진 사람은 임의의 `email`/`sub`/`clientId`로 유효 토큰을 위조 가능 → 전체 SSO 사칭.
- npm 배포하며 "각자 `OAUTH_JWT_SECRET` 세팅하세요"라고 안내하면 마스터키가 모든 사용자 머신
  `~/.claude.json` 평문으로 퍼진다. dotfile 하나 유출로 전체 인증이 뚫린다.
- git repo secret은 CI(GitHub Actions) 전용이고, 런타임에 각 사용자 머신으로 값을 배달하는 용도가 아니다.

**결론: 마스터키를 클라이언트에 배포하지 않는다.** MCP는 다른 앱과 동일하게 oauth-server를 통해
**사용자별·스코프 제한 토큰**을 받아야 한다. 정석은 OAuth 2.1 Authorization Code + PKCE + Refresh Token.

## 목표 아키텍처

MCP는 비밀을 보관할 수 없는 **public/native 클라이언트**다. RFC 8252(OAuth for Native Apps)에 따라
**Authorization Code + PKCE + 루프백 리다이렉트**(`http://127.0.0.1:<random>/callback`)를 쓴다.
클라이언트에 비밀값 0. 발급되는 토큰은 `direct-feedback` clientId로 스코프가 고정되고,
유출 시 해당 사용자 것만 폐기하면 된다.

기존 브라우저 앱(jibsayo/autto/…)이 쓰는 `/api/token` + fragment 흐름은 **그대로 두고**,
새 `/api/oauth/*`를 **추가**한다(기존 앱 영향 0).

## oauth-server 변경 (polymorph-app)

### 1. Prisma 모델 추가 (`schema.prisma`)

```prisma
model AuthorizationCode {
  id            String   @id @default(cuid())
  codeHash      String   @unique @map("code_hash")   // HMAC-SHA256(code, pepper)
  userId        String   @map("user_id")
  clientId      String   @map("client_id")
  redirectUri   String   @map("redirect_uri") @db.Text
  codeChallenge String   @map("code_challenge")      // S256
  scope         String?  @db.Text
  expiresAt     DateTime @map("expires_at")          // now + 60s
  usedAt        DateTime? @map("used_at")            // 단일 사용 표시
  createdAt     DateTime @default(now()) @map("created_at")

  @@map("authorization_codes")
}

model RefreshToken {
  id         String    @id @default(cuid())
  tokenHash  String    @unique @map("token_hash")    // HMAC-SHA256(opaque, pepper)
  userId     String    @map("user_id")
  clientId   String    @map("client_id")
  expiresAt  DateTime  @map("expires_at")
  revokedAt  DateTime? @map("revoked_at")
  rotatedTo  String?   @map("rotated_to")            // 회전 시 새 토큰 id
  createdAt  DateTime  @default(now()) @map("created_at")

  @@index([userId, clientId])
  @@map("refresh_tokens")
}
```

- `ClientApp`에 `refreshTokenLifetime Int @default(2592000)` (30일) 컬럼 추가.
- 토큰/코드는 **평문 저장 금지.** opaque 랜덤값을 `HMAC-SHA256(value, OAUTH_JWT_SECRET)`으로
  해시해 저장하고 비교는 constant-time. **새 시크릿 불필요**(기존 마스터키를 pepper로만 사용, 노출 안 됨).
- 마이그레이션은 신규 테이블/컬럼 추가라 안전. prod DB만 존재하므로 `prisma db push`로 반영.

### 2. Authorization 엔드포인트 — `GET /api/oauth/authorize`

쿼리: `response_type=code`, `client_id`, `redirect_uri`, `code_challenge`,
`code_challenge_method=S256`, `state`, `scope?`.

1. `client_id` + `redirect_uri` 검증 (아래 루프백 정책 포함).
2. NextAuth 세션 없음 → 기존 `/login`으로 유도(로그인 후 authorize로 복귀).
3. 세션 있음 → 랜덤 `code` 생성, `AuthorizationCode` 저장(TTL 60초, 단일 사용),
   `redirect_uri?code=...&state=...`로 리다이렉트(쿼리 사용 — 루프백 서버가 읽을 수 있음).

> fragment(`#token=`)는 루프백 HTTP 서버가 못 읽으므로 code 흐름은 반드시 쿼리로 반환.

### 3. Token 엔드포인트 — `POST /api/oauth/token`

- `grant_type=authorization_code`: `code`, `code_verifier`, `client_id`, `redirect_uri` 검증
  (코드 존재/미만료/미사용, redirect_uri 일치, `SHA256(code_verifier)==code_challenge`).
  통과 시 access JWT(기존 `generateToken`) + opaque refresh token 발급, 코드 소비 처리.
  응답 `{ access_token, token_type: "Bearer", expires_in, refresh_token }`.
- `grant_type=refresh_token`: `refresh_token`, `client_id` 검증 후 **회전**(기존 폐기 + 신규 발급,
  OAuth 2.1 refresh token rotation) + 새 access JWT 발급.

### 4. 루프백 리다이렉트 정책 (`lib/redirectUri.ts`)

RFC 8252 §7.3: 루프백(`http://127.0.0.1`, `http://localhost`, `http://[::1]`)은
**포트를 무시하고** 매칭. `allowedRedirectUris`에 `http://127.0.0.1/callback` 하나 등록하면
런타임 임의 포트를 허용. seed의 `direct-feedback`에 루프백 콜백 추가.

### 5. (2차) 부가 표준 엔드포인트

- `GET /.well-known/oauth-authorization-server` (RFC 8414 메타데이터) — MCP 클라이언트 자동 디스커버리.
- `POST /api/oauth/revoke` (RFC 7009) — 로그아웃 시 refresh token 폐기.

## directfeedback-mcp 변경

- `mintToken()` / `OAUTH_JWT_SECRET` / `DIRECTFEEDBACK_EMAIL` / `DIRECTFEEDBACK_SUB` **전면 제거.**
  남는 env는 `DIRECTFEEDBACK_API`와 (선택) oauth base URL뿐 → **패키지에 비밀값 0, npm 배포 안전.**
- 토큰 저장소: `~/.config/directfeedback-mcp/tokens.json` (chmod 600). access + refresh 캐시.
- **1회 로그인 명령** `npx directfeedback-mcp login`:
  PKCE verifier/challenge + state 생성 → 루프백 서버 기동 → 브라우저로 `/api/oauth/authorize` 오픈
  → `?code=` 수신 → `/api/oauth/token` 교환 → tokens.json 저장.
  (stdio MCP 서버는 기동 중 브라우저 로그인 UX가 어려우므로 로그인은 별도 서브커맨드로 분리.)
- MCP 서버 본체: 저장된 access token 사용, 만료/401 시 refresh로 자동 갱신, 없으면
  "`npx directfeedback-mcp login` 먼저 실행하세요" 안내.

## npm 배포

- `package.json`: `private` 제거, `name`(스코프 결정 필요), `files`, `bin`(server + login),
  `engines`, `repository`, `license`, 스코프면 `publishConfig.access=public`.
- GitHub Actions: 태그 푸시 시 publish. repo secret은 **`NPM_TOKEN`뿐** (OAUTH_JWT_SECRET 아님).

## 커밋 분할 (argocd 부담 완화)

1. `feat(oauth-server)`: prisma 모델/컬럼 추가 + `db push`
2. `feat(oauth-server)`: `/api/oauth/authorize` + 루프백 redirectUri 정책 + seed 갱신
3. `feat(oauth-server)`: `/api/oauth/token` (code + refresh rotation)
4. `feat(oauth-server)`: (2차) discovery metadata + revoke
5. `feat(directfeedback-mcp)`: OAuth 클라이언트 + login 서브커맨드, 마스터키 제거 (별도 repo)
6. `ci(directfeedback-mcp)`: npm publish 워크플로

각 커밋 후 사용자 운영 확인 시간을 둔다. 푸시는 사용자 지시가 있을 때만.

## 확정 결정 (2026-07-14)

1. npm 패키지 이름: **`@polym-team/directfeedback-mcp`** (스코프, `publishConfig.access=public`).
2. 흐름: **루프백 리다이렉트** (RFC 8252). Device Code는 미도입.
3. **discovery 메타데이터 + revoke를 1차에 포함** — 완전한 OAuth AS로 한 번에 구축.

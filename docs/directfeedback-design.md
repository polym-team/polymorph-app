# DirectFeedback — 설계 문서 (Phase 0)

> 제품명 **DirectFeedback** (확정).
> Status: draft / 승인 대기
> Scope: 신규 제품 (polymorph-app 새 앱 `apps/direct-feedback` + Chrome 확장 + MCP 서버)

## 1. 문제 / 목표

디자이너·리뷰어가 **보고 있는 화면 안에서 특정 엘리먼트를 지목해 코멘트**를 남기고, 같은
그룹의 개발자/AI 에이전트가 그 코멘트를 **어느 화면(URL)의 어느 엘리먼트인지와 함께** 보고
바로 수정에 착수하게 한다.

- 1차 대상: **Storybook** (daum-ui / daum-ui-wc). URL→컴포넌트 매핑이 story id 로 자명.
- 추후: 임의 제품 화면으로 확장.
- 최종 가치: **미해결 코멘트 + URL + selector → Claude Code(MCP)** 가 조회해 어느 패키지/
  컴포넌트를 고칠지 즉시 파악.

## 2. Non-goals (Phase 경계)

- 스크린샷/이미지 첨부 (요구 없음 — 텍스트 selector + 코멘트로 충분).
- 실시간 협업 편집(CRDT). 코멘트는 단순 CRUD + 상태(open/resolved).
- oauth-server 에 그룹 개념 추가 (§7 — 코멘트 앱이 자체 소유).
- 1차에서 임의 웹페이지 지원 (Phase 3).

## 3. 아키텍처 (4조각 + OSS 경계)

```
[Chrome 확장 (OSS)]                     리뷰모드·엘리먼트 피커·기존 코멘트 렌더
   │  REST + Bearer(JWT)                (현재 URL 의 코멘트 조회/작성/resolve)
   ▼
[백엔드 앱  apps/direct-feedback  (polymorph, 구현체)]
   Next.js route handlers · Prisma(MySQL) · @polymorph/shared-auth
   models: Group, GroupMember, Comment
   ▲
   │  REST + service/user token
[MCP 서버 (OSS)]  list_unresolved / get / resolve  →  Claude Code

── OSS 경계: 확장 + MCP + OpenAPI 계약이 오픈소스.
   polymorph 의 apps/direct-feedback 는 "그 계약의 한 구현체"(dogfood).
   남들은 자기 백엔드/자기 oauth 를 꽂아 쓸 수 있음.
```

핵심 원칙: **캡처(확장)는 표면별로 교체 가능, 스토어+API+MCP 는 고정.** Storybook→실화면 확장은
캡처 계층만 넓히고 나머지는 재사용.

## 4. 데이터 모델 (Prisma, provider=mysql)

`bookmark-share` 의 org 테넌시를 템플릿으로, 신원은 oauth-server `userId` 로 연결.

```prisma
// apps/direct-feedback/prisma/schema.prisma  (provider = "mysql", url = env("DATABASE_URL"))

model Group {
  id        String        @id @default(cuid())
  name      String
  createdBy String        // oauth-server userId (OWNER)
  members   GroupMember[]
  comments  Comment[]
  createdAt DateTime      @default(now())
}

model GroupMember {
  id       String     @id @default(cuid())
  groupId  String
  userId   String     // oauth-server userId
  email    String     // 초대 이메일 (userId 매핑 전 pending 허용용)
  role     MemberRole @default(MEMBER)
  group    Group      @relation(fields: [groupId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
  @@unique([groupId, userId])
  @@index([userId])
}

enum MemberRole { OWNER MEMBER }

model Comment {
  id         String        @id @default(cuid())
  groupId    String
  // ── URL 키 ─────────────────────────────
  pageUrl    String        // 정규화된 전체 URL
  urlKey     String        // 정규화/그루핑 키 (Storybook: story id)
  // ── 엘리먼트 앵커 ──────────────────────
  cssPath    String        @db.Text  // 절대경로 selector (nth-of-type 체인)
  classList  String        @db.Text  // 공백구분 클래스 (안정 앵커 후보)
  tagName    String
  rect       Json          // {x,y,w,h} 캡처 시점 위치 (참고용)
  anchorHint Json?         // 추가 앵커 후보(텍스트 일부, data-attr 등) — drift 복구용
  // ── 본문/상태 ──────────────────────────
  body       String        @db.Text
  status     CommentStatus @default(OPEN)
  authorId   String        // oauth-server userId
  authorName String
  replies    CommentReply[]
  group      Group         @relation(fields: [groupId], references: [id], onDelete: Cascade)
  createdAt  DateTime      @default(now())
  resolvedAt DateTime?
  @@index([groupId, urlKey, status])
}

enum CommentStatus { OPEN RESOLVED }

model CommentReply {
  id         String   @id @default(cuid())
  commentId  String
  body       String   @db.Text
  authorId   String
  authorName String
  comment    Comment  @relation(fields: [commentId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
}
```

## 5. URL 키 & 정규화

- 저장은 `pageUrl`(전체) + `urlKey`(그루핑/조회 키) 둘 다.
- **Storybook**: `urlKey` = story id (`?path=/story/<id>` 또는 iframe `?id=<id>` 파싱). 컴포넌트
  매핑이 자명 → MCP 가 story id → 소스 경로 역매핑.
- **일반 페이지(Phase 3)**: origin+pathname 기준, 쿼리/해시/세션파라미터 화이트리스트 정규화.
- ⚠️ 길이: selector/본문은 요청 **body(POST)** 로 전송하므로 URL 길이 제한 무관.

## 6. 엘리먼트 앵커 & drift

- 캡처: `cssPath`(nth-of-type 절대경로) + `classList` + `tagName` + `rect` + `anchorHint`.
- 렌더(기존 코멘트 표시): `cssPath` 로 우선 탐색 → 실패 시 `classList`/`anchorHint` 로 근사
  복구 → 그래도 실패면 **orphaned** 목록에 노출(패널 하단). "못 찾음"을 조용히 버리지 않음.
- selector 생성/매칭은 검증된 소형 라이브러리 후보 조사(`finder` 등) — Phase 1 결정.

## 7. 인증

### 7-1. 앱 API ↔ oauth-server (확립된 패턴)
- API route 는 `@polymorph/shared-auth` 의 `authMiddleware({ clientId })` 로 보호.
  요청에 `x-user-id` / `x-user-email` / `x-user-name` 주입 → 그걸 authorId/멤버십에 사용.
- `apps/direct-feedback` 를 oauth-server `prisma/seed.ts` 에 clientId + redirectUri 로 등록.

### 7-2. 확장 ↔ oauth-server (조사 결과: **거의 그대로 호환**)
oauth-server 현황(확인됨):
- 토큰을 **URL fragment `#token=<jwt>`** 로 전달 (`LoginClient.tsx`, `api/silent-auth`).
- redirect URI 검증(`src/lib/redirectUri.ts`)은 **origin+path 매칭, query/fragment 무시**.

→ 이는 `chrome.identity.launchWebAuthFlow` 가 기대하는 방식과 **정확히 일치**. 흐름:
1. 확장이 `chrome.identity.launchWebAuthFlow({ url: <oauth login?redirectUri=https://EXTID.chromiumapp.org/>, interactive: true })`.
2. 사용자가 Google/Kakao 로그인 → oauth-server 가 `https://EXTID.chromiumapp.org/#token=<jwt>` 로 리다이렉트.
3. `chrome.identity` 가 그 최종 URL 을 확장에 반환 → 확장이 fragment 에서 `token` 파싱 → `chrome.storage` 저장 → 이후 API 에 `Authorization: Bearer`.

**oauth-server 변경은 최소 예상**:
- (필수) DirectFeedback client 를 seed 에 등록하고 `allowedRedirectUris` 에
  `https://<EXT_ID>.chromiumapp.org/` 추가.
- (검증) `redirectUri.ts` 의 origin+path 매칭이 `chromiumapp.org` 스킴/호스트를 통과시키는지 확인.
  통과 안 하면 그때 소폭 보강 (사용자 방침: 미지원 시 지원하도록 변경).
- (선택) 확장 UX 상 `shared-auth` 가 Bearer 헤더 검증을 지원하는지 확인(쿠키 외).

### 7-3. 그룹 테넌시
- oauth-server 에 그룹 없음(User 중심) → **apps/direct-feedback 가 Group/GroupMember 소유**.
- "누가 그룹을 묶나": 대시보드에서 OWNER 가 **이메일로 초대** → 대상이 로그인하면
  `email` → `userId` 매핑되어 멤버 확정. (bookmark-share org 흐름과 동일 구조.)
- 코멘트 조회는 항상 `groupId ∈ 내 멤버십` 으로 스코프.

## 8. API 계약 (OpenAPI 초안 — OSS 경계)

```
GET    /api/comments?urlKey=&groupId=&status=open    → Comment[] (+replies)
POST   /api/comments        { groupId, pageUrl, urlKey, cssPath, classList, tagName, rect, body }
PATCH  /api/comments/:id    { status | body }        // resolve / 수정
POST   /api/comments/:id/replies   { body }
GET    /api/groups                                   → 내 그룹 목록
POST   /api/groups          { name }
POST   /api/groups/:id/invite      { email, role }
GET    /api/groups/:id/members
```
- 인증: 모든 엔드포인트 Bearer JWT(확장) 또는 세션쿠키(대시보드). `x-user-id` 로 권한 판정.
- 이 계약을 `openapi.yaml` 로 고정 → 확장·MCP·백엔드가 공유. **OSS 배포 단위.**

## 9. MCP 서버 (OSS)

- Tools: `list_unresolved_comments({ groupId?, urlKey? })`, `get_comment({ id })`,
  `resolve_comment({ id })`, `add_reply({ id, body })`.
- 각 코멘트에 `urlKey`(story id) 포함 → **story id → 소스 컴포넌트 경로 역매핑**(1차: daum-ui/
  daum-ui-wc story→파일 규칙)까지 tool 결과에 포함하면 에이전트가 바로 파일을 연다.
- 인증: 서비스 토큰(그룹 스코프) 또는 사용자 토큰. transport 는 stdio(Claude Code 로컬) 우선.
- 백엔드 REST 를 감싸는 얇은 어댑터 — 백엔드 교체 시 base URL 만 바꿈.

## 10. 배포 / 인프라 (polymorph 패턴 그대로)

- `apps/direct-feedback` (Next.js standalone Docker) → push→GitHub Actions→
  `polymorph-k8s/manifests/direct-feedback/`(deployment·service·ingress·secret)→argocd.
  도메인 `directfeedback.polymorph.co.kr`.
- DB: 자체 **MySQL**(Prisma, `DATABASE_URL`). collab/oauth-server 와 동일 provider.
  인스턴스 프로비저닝(공유 MySQL vs 앱별) 은 Phase 1 에서 기존 앱 매니페스트 확인 후 확정.
- 마이그레이션: `prisma migrate deploy` 실행 지점(빌드/initContainer/수동) 은 기존 앱 관행 따름.

## 11. OSS 경계 & dogfood

- **오픈소스**: Chrome 확장 · MCP 서버 · `openapi.yaml`(+ 레퍼런스 백엔드 최소 구현/도커컴포즈).
- **비공개(polymorph)**: `apps/direct-feedback` 실구현체 (oauth-server·사내 도메인·k8s secret 결합).
- 결합 해소 포인트: oauth URL / API base URL 은 env 로 (`NEXT_PUBLIC_OAUTH_SERVER_URL` 선례),
  JWT_SECRET 등 사내 값은 secret 으로 분리. 확장/MCP 는 사내 특이성 0.

## 12. 로드맵

| Phase | 산출물 |
|---|---|
| **0 (본 문서)** | 아키텍처·데이터모델·API 계약·인증 플로우·그룹모델 확정 |
| **1** | `apps/direct-feedback` 스켈레톤: Prisma 스키마+마이그레이션, `/comments`·`/groups` API, shared-auth, oauth seed 등록. **확장↔oauth `chrome.identity` 인증 PoC.** Storybook 오버레이(확장)로 read/write 최소 루프 |
| **2** | MCP 서버 + story id→컴포넌트 역매핑. Claude Code 조회→수정 루프 |
| **3** | 임의 제품화면 캡처(페이지 무관) + selector drift/orphan 처리 + 대시보드(그룹/초대) |

## 13. 열린 결정 사항

1. ~~제품 이름~~ → **DirectFeedback 확정.**
2. **확장 인증**(방침 확정: 미지원 시 oauth-server 변경) → 조사 결과 **거의 호환**. 남은 작업은
   (a) seed 에 `chromiumapp.org` redirect URI 등록, (b) `redirectUri.ts` 가 통과시키는지 검증,
   (c) `shared-auth` Bearer 검증 지원 확인. Phase 1 초반 PoC 로 처리.
3. **DB 프로비저닝**: 공유 MySQL 에 direct-feedback DB 하나 vs 앱 전용 — 기존 앱 매니페스트 확인 후.
4. **selector 라이브러리** 선정(생성/매칭/drift 복구).
5. **MCP 인증 모델**: 서비스 토큰 vs 사용자 토큰.
6. **오픈소스 repo 구성**: 모노레포(확장+MCP+spec) 1개 vs 분리.

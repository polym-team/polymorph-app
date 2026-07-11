# DirectFeedback — 아키텍처 & 저장소 맵

> 이 디렉토리는 **백엔드(구현체)** 한 조각일 뿐이고, DirectFeedback 은 여러 저장소에
> 걸쳐 있다. 이 문서는 전체 그림을 다시 잡기 위한 진입점이다.
> 상세 설계/의사결정: [`polymorph-app/docs/directfeedback-design.md`](../../docs/directfeedback-design.md)

## 1. 무엇인가

디자이너·리뷰어가 **보고 있는 화면에서 특정 엘리먼트를 지목해 코멘트**를 남기고, 같은
그룹의 개발자/AI 에이전트(Claude Code)가 그 코멘트를 **URL(어느 화면) + selector(어느
엘리먼트) + 본문**과 함께 조회해 바로 수정에 반영하는 리뷰 도구. 1차 대상은 **Storybook**.

핵심 원칙: **캡처(확장)는 표면별로 교체 가능, 스토어(백엔드)+API+MCP 는 고정.**
확장·MCP·OpenAPI 는 오픈소스 경계, 이 백엔드는 "그 계약의 한 구현체(dogfood)".

## 2. 구성 요소 & 저장소

| 조각 | 위치 | 역할 |
|---|---|---|
| **백엔드 (이 디렉토리)** | `polymorph-app/apps/direct-feedback` | Next.js(App Router) + Prisma. 코멘트/그룹 REST API + 대시보드 웹 + `/privacy` |
| **Chrome 확장 (캡처)** | https://github.com/polym-team/directfeedback-extension | MV3. 리뷰모드·엘리먼트 피커·마커·oauth 로그인 |
| **MCP 서버 (에이전트 연결)** | https://github.com/polym-team/directfeedback-mcp | stdio MCP. 미해결 코멘트를 Claude Code 에 노출 |
| **k8s 매니페스트** | `polymorph-k8s/{apps,manifests}/direct-feedback` | argocd Application + Deployment/Service/Ingress/Secret |
| **설계 문서** | `polymorph-app/docs/directfeedback-design.md` | Phase 0 아키텍처·의사결정 |
| **인증** | `polymorph-app/apps/oauth-server` (공유) | OAuth(Google/Kakao) + HS256 JWT. `direct-feedback` client 등록됨 |

배포 프로덕션: **https://directfeedback.polymorph.co.kr** (대시보드 `/`, API `/api/*`, 정책 `/privacy`)

## 3. 아키텍처

```
┌────────────────────────┐        ┌────────────────────────┐
│ Chrome 확장 (OSS)       │        │ 대시보드 (this app /)   │
│ 리뷰모드·피커·마커       │        │ 그룹 생성·초대링크·멤버 │
│ 로그인: chrome.identity │        │ 로그인: web redirect     │
└──────────┬─────────────┘        └───────────┬────────────┘
   Bearer JWT │                       세션 쿠키 │
             ▼                                 ▼
        ┌─────────────────────────────────────────────┐
        │ 백엔드  apps/direct-feedback (Next route handlers)│
        │  @polymorph/shared-auth 로 JWT 검증           │
        │  Prisma → MySQL(majac)                        │
        │  models: Group / GroupMember / Comment / Reply │
        └───────────────┬───────────────────────────────┘
                        ▲  REST (Bearer, 토큰 mint)
                        │
             ┌──────────┴───────────┐
             │ MCP 서버 (OSS)        │  list_unresolved / resolve / add_reply
             │ Claude Code 에 연결   │
             └──────────────────────┘

인증서버: oauth.polymorph.co.kr (모든 로그인 위임, 공유 OAUTH_JWT_SECRET)
```

## 4. 코멘트 수명주기

1. 디자이너가 확장 **리뷰모드** → 엘리먼트 클릭 → 코멘트 작성
   → `POST /api/comments` (Bearer). 저장: `urlKey`(Storybook story id)·`cssPath`·`classList`·`tagName`·`rect`·`body`.
2. 같은 그룹원(확장/대시보드)이 재방문 → `GET /api/comments?groupId&urlKey` → 마커로 표시.
3. 개발자(Claude Code) → MCP `list_unresolved_comments` → `urlKey`(story id)로 소스 grep → 컴포넌트 수정.
4. `resolve_comment` (→ `PATCH status=RESOLVED`) 또는 `DELETE`.

## 5. 데이터 모델 (`prisma/schema.prisma`, MySQL)

- **Group** `{ id, name, createdBy(oauth userId), inviteToken(초대링크) }`
- **GroupMember** `{ groupId, email(초대·식별 키), userId?(최초 로그인 시 claim), role(OWNER|MEMBER) }` — `@@unique([groupId,email])`
- **Comment** `{ groupId, pageUrl, urlKey, cssPath, classList, tagName, rect(Json), anchorHint(Json?), body, status(OPEN|RESOLVED), authorId, authorName, resolvedAt }`
- **CommentReply** `{ commentId, body, authorId, authorName }`

> prisma 클라이언트(`src/generated/prisma`)는 gitignore. Docker 빌드에서 `db:generate` 로 생성.
> 스키마 변경은 `prisma db push`(현재 마이그레이션 히스토리 없이 운용).

## 6. API (`src/app/api/*`)

| 메서드 · 경로 | 설명 |
|---|---|
| `GET/POST /api/groups` | 내 그룹 목록 / 생성(초대토큰 발급) |
| `POST /api/groups/:id/invite` | OWNER 이메일 초대 |
| `GET /api/groups/:id/members` | 멤버 목록 |
| `POST /api/groups/join` | 초대 토큰으로 합류 |
| `GET/POST /api/comments` | 조회(groupId·urlKey·status) / 작성 |
| `PATCH/DELETE /api/comments/:id` | 상태변경(resolve)·본문수정 / 삭제 |
| `POST /api/comments/:id/replies` | 답글 |
| `POST /api/auth/set-cookie` | 대시보드 웹 로그인 쿠키 저장 |
| `GET /api/health` | 헬스체크 |

## 7. 인증 (`src/lib/auth.ts`)

- **검증**: `@polymorph/shared-auth` `validateToken` — HS256 `OAUTH_JWT_SECRET`, issuer `oauth.polymorph.co.kr`.
- **확장**: `Authorization: Bearer <jwt>` (chrome.identity 로그인 → `#token` → chrome.storage).
- **대시보드**: HttpOnly 쿠키 (web redirect → `/auth/callback` → `/api/auth/set-cookie`).
- `auth.ts` 가 Bearer/쿠키 양쪽 수용 → oauth `userId`/`email` 추출.
- **멤버십**: `email` 매칭(+최초 접근 시 pending 멤버의 `userId` claim). oauth-server 엔 그룹 개념
  없음 → 그룹은 이 앱이 소유.
- oauth-server `prisma/seed.ts` 의 `direct-feedback` client redirect:
  `http://localhost:3008/auth/callback` + 확장 `https://<EXT_ID>.chromiumapp.org/`
  (로컬 unpacked + 웹스토어 ID 둘 다 등록).

## 8. 배포 토폴로지

- **트리거**: `apps/direct-feedback/**` (또는 공유 packages) main push
  → `.github/workflows/direct-feedback-deploy-polymorph-k8s-prd.yaml`
  → ghcr 이미지 빌드(빌드 시 prisma generate) → `polymorph-k8s/manifests/direct-feedback/
  deployment.yaml` 이미지 태그 갱신 커밋 → **argocd 자동 싱크** → `directfeedback.polymorph.co.kr`(traefik).
- **DB**: `majac.iptime.org:13306/directfeedback` (MySQL). **로컬·prod 동일 DB 공유**(개인용).
- **Secret**(`polymorph-k8s/manifests/direct-feedback/secret.yaml`): `DATABASE_URL`,
  `OAUTH_JWT_SECRET`(=prod oauth 와 동일), `NEXT_PUBLIC_OAUTH_SERVER_URL`.

## 9. 로컬 개발

```bash
# 백엔드(3008) + oauth-server(3007) 동시
pnpm direct-feedback                 # polymorph-app 루트

# 리뷰 대상 Storybook (frontend-monorepo-turbo repo)
pnpm daum-ui-wc:storybook            # :6107
```
`apps/direct-feedback/.env`: `DATABASE_URL`, `OAUTH_JWT_SECRET`, `NEXT_PUBLIC_OAUTH_SERVER_URL`
(로컬은 `http://localhost:3007`). 확장/MCP 로컬 override 는 각 repo README 참고.

## 10. 주요 결정 · 주의점

- **OSS 경계**: 확장·MCP·API 계약은 공개 가능, 이 백엔드는 사내 구현체. 클라이언트는 env 로
  백엔드/oauth 교체 가능.
- **selector drift**: 엘리먼트 앵커는 `cssPath`(data-testid > 안정클래스 > nth-of-type) +
  재탐색 fallback(텍스트·클래스). 임의 DOM 편집 100% 추적은 불가 — 못 찾으면 orphan 처리.
- **확장 배포**: Chrome 웹스토어 **Unlisted**. ID `eooipclemnmfgcmkpcedkejelmnjlpkb`.
- **prisma generated 는 gitignore** — 배포 빌드에서 생성. 로컬은 `pnpm --filter direct-feedback db:generate`.

## 11. 현재 상태

- 백엔드/대시보드/공유(초대링크)/삭제 — ✅ prod 라이브
- 확장(캡처·마커·단축키·강조색·앵커·SPA 대응) — ✅ GitHub, 웹스토어 검토 대기
- MCP — ✅ Claude Code 등록·검증
- 남은 다듬기: 확장 설정 UI(현재 SW 콘솔 override), story id→소스경로 자동 역매핑, OpenAPI 계약 문서화

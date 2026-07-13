# myFlightHistory — 항공편 이력/예측 앱 계획서

> 상태: **설계 단계 (착수 전)**
> 최종 갱신: 2026-07-12

## 1. 목표

사용자가 자기 항공편을 등록하면, 자기 일정을 중심으로 **과거·현재·미래(지연 예측 포함)** 를 한눈에 보는 서비스. FlightRadar24처럼 전 세계 비행기를 실시간 추적하는 게 아니라, **"내 항공편" 중심의 개인 타임라인 + 지연 예측**이 핵심이다.

핵심 통찰: 이 앱은 실시간 위치(레이더/ADS-B)가 주력이 아니다. 필요한 건 **항공편 스케줄/상태 데이터 + 과거 정시운항 이력(예측용)** 이며, 실시간 위치는 부가 기능이다.

## 2. 데이터 소스 전략 (전부 무료로 시작)

| 용도 | 소스 | 비고 |
|---|---|---|
| 내 항공편 자동 등록 | **Google Calendar** (`calendar.events.readonly`) | Gmail 예약메일이 자동 생성한 항공편 이벤트를 읽어옴. 1차 목표 |
| 내 항공편 수동 등록 | 앱 자체 입력 폼 | 캘린더 파싱 실패/누락 보정용. 필수 |
| 지연 예측 모델 학습 | **US BTS on-time performance** (공개·무료) | 미국 노선 한정 MVP. 편명/노선/요일/시간대 기반 |
| (후순위) 실시간 위치·상태 | OpenSky(무료), 상업 API(AeroDataBox 등) | 나중 단계 |

## 3. 확정된 설계 결정

- **동의 화면/심사**: 우선 **프로토타입** — 기존 External 앱에 테스트 사용자로 등록(최대 100명). 구글 심사 없이 개발, "확인되지 않은 앱" 경고는 감수. 방향 확정되면 정식 심사 또는 Internal(Workspace 전용)로 전환.
- **토큰 관리 위치**: **oauth-server 브로커.** 캘린더 refresh token은 oauth-server가 저장·갱신하며 **절대 밖으로 내보내지 않는다.** 앱은 raw 토큰이 아니라 "내 캘린더 이벤트" 프록시 API만 서버사이드로 호출.
- **로그인 흐름 불변**: 캘린더 scope를 공용 로그인(`openid profile email`)에 얹지 않는다. **incremental authorization** — 앱에서 사용자가 "캘린더 연결"을 명시적으로 눌렀을 때만 별도 흐름으로 캘린더 scope + `access_type=offline`를 요청. (다른 앱 사용자에게 불필요한 캘린더 동의를 강요하지 않기 위함.)
- **scope**: ~~읽기 전용~~ → **`https://www.googleapis.com/auth/calendar`** (write-back 도입으로 상향, 아래 참조).
- **캘린더가 단일 진실원천(write-back)**: 수동 등록 항공편은 앱 DB가 아니라 **전용 "MyFlightHistory" 캘린더**에 이벤트로 써넣는다. `extendedProperties.private.myfh`(JSON)에 구조화 데이터를 심어 무손실 왕복. 읽기는 **하이브리드** — primary(구글 Gmail 자동생성, 휴리스틱 파싱) + 전용(수동, 무손실) 병합, 중복 시 수동 우선. → 앱 DB 불필요, 사용자 구글 캘린더에도 노출.

## 4. 아키텍처

```
[myFlightHistory 앱]                              [oauth-server]                    Google
     │                                                  │
     │──① 로그인(기존 ClientApp 흐름)──────────────────▶│──── openid/profile/email ──▶ (로그인, scope 불변)
     │◀──────────── JWT(HttpOnly 쿠키) ─────────────────│
     │                                                  │
     │──② "캘린더 연결" 클릭 → /connect/google-calendar▶│
     │                                                  │──── calendar.events.readonly
     │                                                  │      + access_type=offline
     │                                                  │      + prompt=consent ──────▶ 동의 화면
     │                                                  │◀──── code → refresh token
     │                                                  ▼
     │                                    [GoogleCalendarGrant] refreshToken(암호화) 저장
     │                                                  │
     │──③ 서버사이드: 내 캘린더 이벤트 요청 ───────────▶│ GET /api/google/calendar/events
     │       (JWT + 서버간 시크릿)                       │   access token 자동 갱신 → Calendar API 프록시
     │◀──────────── 이벤트 목록 ────────────────────────│
     ▼
 항공편 이벤트 필터 → 편명/출도착 추출 → 앱 DB 저장 → 타임라인/예측 표시
```

**원칙**: refresh token은 oauth-server 밖으로 나가지 않는다. 브로커 API가 갱신·프록시를 전담해 다른 앱도 재사용 가능한 구조.

## 5. 작업 단위 (커밋 분리)

> 대규모 변경은 argocd 부담을 줄이려 영향 단위로 커밋을 쪼갠다. 푸시는 사용자 지시가 있을 때만.

### A. oauth-server (`polymorph-app/apps/oauth-server`)

1. **DB 스키마 추가** — `GoogleCalendarGrant` 테이블 + Prisma migration
   ```prisma
   model GoogleCalendarGrant {
     id                   String    @id @default(cuid())
     userId               String    @unique @map("user_id")
     refreshToken         String    @map("refresh_token") @db.Text  // AES 암호화 저장
     accessToken          String?   @map("access_token") @db.Text
     accessTokenExpiresAt DateTime? @map("access_token_expires_at")
     scopes               String    @db.Text
     createdAt            DateTime  @default(now()) @map("created_at")
     updatedAt            DateTime  @updatedAt @map("updated_at")
     user User @relation(fields: [userId], references: [id], onDelete: Cascade)
     @@map("google_calendar_grants")
   }
   ```
   (User 모델에 `googleCalendarGrant GoogleCalendarGrant?` 역참조 추가)

2. **연결 흐름** — 로그인 provider(NextAuth)와 분리된 raw OAuth2 code flow
   - `GET /connect/google-calendar` — 로그인된 사용자만. `googleapis` OAuth2Client로 Google 인증 URL 생성(`scope=calendar.events.readonly`, `access_type=offline`, `prompt=consent`, `state`=CSRF+returnUrl)
   - `GET /api/connect/google-calendar/callback` — code → refresh/access token 교환 → 암호화 후 `GoogleCalendarGrant` upsert → 앱 returnUrl로 복귀
   - 기존 로그인 scope는 **손대지 않음**

3. **브로커 API** — `GET /api/google/calendar/events?timeMin&timeMax`
   - shared JWT + 서버간 시크릿으로 인증(앱 서버사이드에서만 호출)
   - access token 만료 시 저장된 refresh token으로 자동 갱신 후 저장 갱신
   - Google Calendar `events.list` 프록시 → 결과 반환. **raw 토큰은 응답에 포함하지 않음**

4. **연결 해제** — `DELETE /api/google/calendar/grant` + 계정 페이지에 연결 상태 표시(선택)

5. **토큰 암호화 유틸** — `GOOGLE_TOKEN_ENC_KEY`(env)로 AES-256-GCM 암복호화. refresh token은 평문 저장 금지

### B. k8s (`polymorph-k8s`)

6. `manifests/oauth-server/`의 secret에 `GOOGLE_TOKEN_ENC_KEY` 추가, deployment에 주입
7. 새 앱 `manifests/myflighthistory/` + `apps/myflighthistory/application.yaml` (배포 단계에서)

### C. myFlightHistory 앱 (`polymorph-app/apps/myflighthistory`)

8. **스캐폴딩** — Next.js 앱 (로컬 포트 3009), 공유 패키지(`@package/ui` 등) 연결
9. **oauth 로그인 통합** — `/auth/callback`, `/api/auth/set-cookie`, `middleware.ts`(shared-auth). seed.ts에 ClientApp 등록:
   ```ts
   {
     clientId: 'myflighthistory',
     name: 'MyFlightHistory',
     allowedRedirectUris: [
       'http://localhost:3009/auth/callback',
       'https://myflighthistory.polymorph.co.kr/auth/callback',
     ].join(','),
     accessTokenLifetime: 60 * 60 * 24 * 7,
   }
   ```
10. **캘린더 연결 UI** — "구글 캘린더 연결" 버튼 → oauth-server `/connect/google-calendar?returnUrl=...`
11. **캘린더 sync** — 서버사이드에서 브로커 `/api/google/calendar/events` 호출 → 항공편 이벤트 필터 → 편명/출발·도착 공항/시각 추출 → 앱 DB 저장
12. **수동 입력 폼** — 파싱 실패/누락 보정
13. **타임라인 UI** — 과거/현재/미래 항공편 표시
14. **(후순위) 지연 예측** — BTS 데이터 기반 모델. 별도 단계로 분리

### D. Google Cloud Console (수동 — 사용자가 직접)

15. OAuth 동의 화면에 `.../auth/calendar.events.readonly` scope 추가 (민감 scope, 게시 상태 = 테스트)
16. 테스트 사용자에 본인 계정 등록 (최대 100명)
17. 승인된 리디렉션 URI 추가:
    - `http://localhost:3007/api/connect/google-calendar/callback`
    - `https://oauth.polymorph.co.kr/api/connect/google-calendar/callback`

## 6. 짚고 갈 것 / 리스크

- **캘린더 항공편 이벤트 파싱 신뢰도**: 구글이 Gmail에서 자동 생성한 이벤트는 편명·시각이 구조화 필드가 아니라 제목/설명/위치에 묻혀 있는 경우가 많다. 초기엔 휴리스틱 파싱 + 수동 보정 병행. 따라서 **수동 입력 폼(작업 12)은 옵션이 아니라 필수.**
- **민감 scope + 테스트 모드**: 테스트 사용자 100명 제한, "확인되지 않은 앱" 경고 화면. 정식 공개 시 구글 심사(수일~수주) 또는 Internal 전환 필요.
- **예측은 미국(BTS) 한정 MVP**: 한국/기타 노선 예측은 데이터 확보 후 확장.
- **oauth-server가 토큰 브로커가 됨**: 공용 인증 서버에 리소스 접근 책임이 추가되는 셈. refresh token 암호화·최소 노출·연결 해제 경로를 초기에 확실히 잡을 것.

## 7. 진행 현황

### ✅ A. oauth-server (완료)
- **A-1** `GoogleCalendarGrant` 스키마 + 운영 DB `db push` 반영 완료
- **A-5** 토큰 암호화 유틸 `tokenCrypto.ts` (AES-256-GCM)
- **A-2** 연동 흐름 `GET /api/connect/google-calendar` + `/callback` (incremental auth, CSRF state 쿠키)
- **A-3** 브로커 API `GET /api/google/calendar/events` + `calendarBroker.getValidAccessToken`
- **A-4** 상태 조회/해제 `GET|DELETE /api/connect/google-calendar/grant`

> **로컬 `.env` 에 생성해둔 시크릿 2개** (gitignore, 값은 별도 보관):
> - `GOOGLE_TOKEN_ENC_KEY` (32B hex) — 토큰 암호화 키
> - `CALENDAR_BROKER_SECRET` — 브로커 API 서버간 시크릿
>
> ⚠️ 로컬이 운영 DB 에 직접 쓰므로, **이 두 값은 k8s secret(B-6) 및 myFlightHistory 앱과 반드시 동일해야 함.** (다른 키 → 암복호화/인증 불일치)

### ✅ D. Google Cloud Console (완료 — okra-polymorph 프로젝트)
scope(`calendar.events.readonly`) 추가, 테스트 사용자 등록, 리디렉션 URI 2개 등록 완료.

### ✅ C. myFlightHistory 앱 (핵심 슬라이스 완료)
- 스캐폴딩(포트 3009) + oauth 로그인 통합(silent SSO, callback, set-cookie/me/logout)
- ClientApp `myflighthistory` seed 등록, 로컬 `.env` 에 공유 시크릿(OAUTH_JWT_SECRET/CALENDAR_BROKER_SECRET) 복사
- `GET /api/calendar/events`: 브로커 서버사이드 프록시(시크릿/JWT 미노출)
- `flightParser`: 캘린더 이벤트 → 편명/노선 휴리스틱 추출
- 홈 UI: 캘린더 연결 버튼 + 예정/지난 항공편 타임라인 + 결과 배너
- 빌드/tsc/lint 통과. **로컬 E2E 테스트 대기**(`pnpm myflighthistory`)

### ✅ E. write-back (하이브리드) 완료
- 브로커 확장: scope→`calendar`, 캘린더 목록/생성, 이벤트 생성/삭제, `calendarId` 지정 읽기, `extendedProperties` 통과
- 앱: 전용 캘린더 find-or-create, 수동 등록(정규 이벤트+extendedProperties write-back), 하이브리드 병합(수동 우선), 삭제, 수동 등록 폼 UI
- 파서: 무손실 경로 + source(manual/auto) + 편명 정규화 중복제거
- 빌드/tsc/lint 통과. **⚠️ scope 변경 → 재검증 전 필수 선행작업 아래 참조**

### ⬜ 남은 것
- **⚠️ 구글 콘솔에 `calendar` scope 추가 + 앱에서 캘린더 재연결**(readonly→calendar 상향이라 재동의 필수). 그 전엔 write-back(수동등록)이 권한부족으로 degrade됨
- **로컬 E2E 재검증**: 재연결 후 수동 등록 → 전용 캘린더 생성/이벤트 확인 → 목록에 "직접 등록" 표시·삭제 확인
- **✅ F. 지연/실시간 (완료)**:
  - 휴리스틱 예측 엔진(pluggable) — 국내/국제·시간대·요일·계절, 예정 항공편에 부여
  - 실시간 상태(임박 항공편): **인천공항 공식 API**(국제선, 검증됨) + **airportal**(국내선, 비공식 best-effort). 있으면 예측보다 우선.
  - ⚠️ BTS는 폐기(미국 전용). data.go.kr 과거 지연통계 API는 부재(파일뿐)라 realtime+휴리스틱 조합으로 감. 실시간은 임박(D-3~D+6)에만 표시.
  - ⚠️ airportal은 비공식·세션쿠키 가능성 → **로컬 실검증 필요**(샌드박스에서 POST 테스트 불가)
- **B. k8s 배포**: oauth-server secret 에 `GOOGLE_TOKEN_ENC_KEY`+`CALENDAR_BROKER_SECRET` 주입, `manifests/myflighthistory/` + `apps/myflighthistory/application.yaml`, myflighthistory secret(JWT/broker/oauth URL)

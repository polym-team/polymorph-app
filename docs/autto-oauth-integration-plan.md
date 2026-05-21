# autto → oauth-server 통합 계획서

작성일: 2026-05-21

---

## 🚀 신규 에이전트 시작 안내 (먼저 읽을 것)

이 문서는 autto의 자체 인증을 polymorph oauth-server 통합 인증으로 교체하는 **단독 실행 계획서**다. 이전 대화 컨텍스트 없이도 이 파일만 읽고 작업을 이어받을 수 있다.

### 작업 시작 전 필수 확인
1. **이 문서를 끝까지 읽기** — 결정 사항 / 위험 / 단계별 체크리스트 모두 파악
2. **참고 문서**:
   - `/Users/rootbeer.axz-pc/Documents/project/polymorph-app/CLAUDE.md` — polymorph 모노레포 규칙
   - `/Users/rootbeer.axz-pc/Documents/project/polymorph-app/apps/oauth-server/CLAUDE.md` — oauth 통합 가이드 (필독)
   - `/Users/rootbeer.axz-pc/Documents/project/polymorph-app/docs/kream-office-migration-plan.md` — 유사 사례 참고
3. **참고 디렉토리/파일**:
   - `apps/autto/` — 작업 대상
   - `apps/jibsayo/middleware.ts`, `apps/jibsayo/src/app/auth/callback/`, `apps/jibsayo/src/app/api/auth/` — 통합 reference 구현 (가장 비슷한 reference)
   - `packages/shared-auth/` — 인증 라이브러리

### 진행 원칙
- **각 Phase 종료 시 반드시 사용자 확인 받고 다음 Phase 진입** (자율 진행 금지)
- **Phase 0 백업은 절대 생략 금지**
- **푸시는 사용자 명시 요청 시에만**
- **현재 진행 중인 Phase는 이 문서 하단 "진행 상태 추적" 섹션에 기록**

### 시작 위치
- 아직 시작 전 → "Phase 0: 백업"부터
- 진행 중 → "진행 상태 추적" 섹션의 마지막 항목 참고

---

## 개요

`apps/autto`는 현재 자체 next-auth(Google) 인증 + 자체 `User` 테이블을 사용 중이다. 이를 polymorph oauth-server 통합 인증으로 교체한다.

- 운영 도메인: `autto.polymorph.co.kr` (기존 그대로)
- 사용자 수: 2~5명 (소수, 데이터 매핑 신중하게)
- ClientApp 등록: 이미 `apps/oauth-server/prisma/seed.ts`에 `autto` 등록되어 있음

핵심 키워드: **자체 User 테이블 제거 + FK를 oauth User.id(string)로 직접 교체**.

---

## 결정 사항

| 항목 | 결정 | 근거 |
|---|---|---|
| User 매핑 방식 | autto `User` 테이블 제거, `DhAccount.userId`를 oauth User.id(String)로 교체 | autto는 자체 DB라 Firestore와 달리 자유롭게 스키마 변경 가능. 부채로 남는 매핑 컬럼을 만들지 않음. |
| 사용자 데이터 매핑 | 이메일 기준 1:1 매핑 (autto는 Google 전용이라 안전) | autto User 모두 Google 가입자. 같은 Google 이메일이면 oauth-server에 동일 User 존재 가능성 높음. |
| 매핑 스크립트 | dry-run 모드 우선 → 결과 검토 후 실 실행 | 사용자 2~5명이라 적지만, FK 일괄 교체라 실수 시 데이터 분리 위험. |
| Admin 권한 | 기존 `ADMIN_EMAIL = 'majac6@gmail.com'` 그대로 유지 | 간단. 추후 별도 권한 모델로 확장 가능. |
| oauth-server 변경 | JWT payload에 `linkedEmails` 추가 (Phase 1 검증 중 발견) | 카카오 단독 가입자처럼 oauth.User.email이 더미인 경우, 자체 인증 시절 google email로 저장된 autto users와 매핑할 수 없음. account.email 목록을 토큰에 포함시켜 각 앱이 매핑 시도 가능하게 함. 후속 앱(rootbeer-employee-mall) 마이그레이션에도 동일하게 재사용. |
| 컷오버 | 단순 컷오버, 사전 공지 생략 | 사용자 5명 이하, 본인 또는 친한 지인. |

---

## 현재 상태 분석

### autto 기술 스택
- Next.js 15.3 + React 19 + TypeScript 5.7
- 패키지 매니저: pnpm workspace
- DB: MySQL (Prisma 6)
- 로컬 포트: 3006

### autto 인증 현재 구조 (제거 대상)
- `src/lib/auth.ts` — next-auth GoogleProvider + 자체 signIn/session 콜백
- `src/app/api/auth/[...nextauth]/route.ts` — next-auth 핸들러
- `src/app/login/page.tsx` — 자체 로그인 페이지 (`signIn('google')` 호출)
- `src/components/AuthProvider.tsx` — `SessionProvider` 래퍼
- `src/lib/api-utils.ts` — `getSessionUser`, `requireAuth`, `requireAdmin`
- 모든 client 컴포넌트가 `useSession()`, `signOut()` 사용 (Dashboard 등)

### autto Prisma 스키마 현재 (`apps/autto/prisma/schema.prisma`)
```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  name         String
  profileImage String?
  googleId     String?  @unique
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  dhAccounts   DhAccount[]
}

model DhAccount {
  id     Int @id @default(autoincrement())
  userId Int @map("user_id")  // ← 이게 변경 대상
  ...
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

`LottoPreset`, `PurchaseLog`는 `DhAccount.id`(Int)를 FK로 가지므로 직접 영향 없음 (DhAccount만 잘 옮기면 자동으로 따라옴).

### oauth-server 측 준비 상태
- ✅ `apps/oauth-server/prisma/seed.ts`에 `autto` ClientApp 등록 완료
  - `clientId: 'autto'`
  - `allowedRedirectUris`: `http://localhost:3006/auth/callback`, `https://autto.polymorph.co.kr/auth/callback`
  - `accessTokenLifetime`: 7일
- ✅ `packages/shared-auth` 사용 가능
- ✅ oauth-server `User.id`는 cuid (String). FK 타입을 String으로 바꿔야 함.

### 영향 받는 호출 지점 (수정 대상 파일)
- API:
  - `apps/autto/src/app/api/settings/route.ts` — `requireAuth()` + `user!.id` 4곳
  - `apps/autto/src/app/api/lotto/balance/route.ts`
  - `apps/autto/src/app/api/lotto/history/route.ts`
  - `apps/autto/src/app/api/lotto/buy/route.ts`
  - `apps/autto/src/app/api/admin/network-test/route.ts` — `requireAdmin()`
  - `apps/autto/src/app/api/auth/[...nextauth]/route.ts` — 삭제
  - `apps/autto/src/app/api/cron/auto-purchase/route.ts` — 세션 무관 (cron-auth로 보호)
  - `apps/autto/src/app/api/cron/weekly-report/route.ts` — 동일
- Client:
  - `apps/autto/src/components/AuthProvider.tsx` — 삭제 또는 빈 래퍼로
  - `apps/autto/src/components/Dashboard.tsx` — `useSession` 제거, `/api/auth/me` 사용
  - `apps/autto/src/app/login/page.tsx` — oauth-server로 리다이렉트하도록 변경 (또는 삭제하고 미들웨어가 처리)
  - `apps/autto/src/app/layout.tsx` — `AuthProvider` 제거 검토

---

## 핵심 위험: 데이터 매핑 오류

`DhAccount.userId` FK 타입을 Int → String으로 바꾸는 작업이 핵심 위험 포인트. 매핑이 잘못되면 사용자 A의 로또 계정/구매 이력을 B가 보게 됨.

**방어 수칙:**
1. Phase 0에서 DB 덤프 확보 (롤백 가능 상태)
2. 매핑 스크립트는 dry-run 우선 (이메일 매칭 결과를 사람이 눈으로 확인)
3. 매핑 단계에서는 새 컬럼 `oauth_user_id String?`을 임시로 추가 → 모든 데이터 채운 뒤 → 검증 → 그 다음에 기존 `user_id`(Int) drop
4. 매핑 실패한 autto User가 있으면 작업 중단하고 사용자에게 확인 (예: oauth-server에 등록 안 된 이메일)

---

## 4단계 실행 계획

### Phase 0: 백업 (1시간)

**목표**: 어떤 일이 있어도 데이터 복원 가능한 상태 확보.

- [ ] autto DB 전체 덤프 (`mysqldump`) → 안전한 위치 저장
  - 대상 테이블: `users`, `dh_accounts`, `lotto_presets`, `purchase_logs`
- [ ] oauth-server DB 덤프 (스키마 변경은 없지만 매핑 결과 검증용으로 before/after 비교)
- [ ] autto 운영 사용자 목록 export (이메일 기준)
  ```sql
  SELECT id, email, name, google_id FROM users;
  ```
  → 이 결과를 매핑 dry-run 입력으로 사용
- [ ] 시크릿 정리 (별도 안전한 곳에):
  - `NEXTAUTH_SECRET` (제거 예정이지만 백업)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (autto에서는 제거됨. oauth-server가 사용)
  - 매핑 종료 후 GitHub Actions / k8s secret에서도 제거 필요

**완료 기준**: 덤프 파일 손에 있고, 복원 명령어 1줄로 설명 가능.

---

### Phase 1: oauth-server 통합 (1~2일)

**목표**: 자체 인증 제거, oauth-server JWT 쿠키 기반으로 전환. DB 스키마는 아직 안 건드림 (Phase 2에서 변경).

이 Phase 끝나면 **로그인은 oauth-server로 일원화되지만, autto DB의 `users` 테이블과 `dh_accounts.user_id`(Int)는 여전히 존재**한다. autto 코드 내부에서 oauth User.id → autto User.id 매핑을 거치는 임시 상태.

#### 1-1. 의존성 정리
- [ ] `apps/autto/package.json` 의존성 추가: `@polymorph/shared-auth: workspace:*`
- [ ] `next-auth` 의존성은 Phase 1 마지막에 제거 (호출처 전부 정리한 뒤)
- [ ] `pnpm install`

#### 1-2. 미들웨어 추가
- [ ] `apps/autto/middleware.ts` 작성 (jibsayo middleware.ts 복제 후 `CLIENT_ID = 'autto'`)
  - `onUnauthenticated: 'silent'` (silent SSO)
  - matcher에서 `/api`, `/_next/*`, `/auth/callback` 등 제외

#### 1-3. 콜백 페이지 및 set-cookie API
- [ ] `apps/autto/src/app/auth/callback/page.tsx` 작성 (jibsayo CallbackClient 복제)
- [ ] `apps/autto/src/app/auth/callback/CallbackClient.tsx`
- [ ] `apps/autto/src/app/api/auth/set-cookie/route.ts` 작성 (jibsayo 복제)
- [ ] `apps/autto/src/app/api/auth/logout/route.ts` 작성
- [ ] `apps/autto/src/app/api/auth/me/route.ts` 작성 — 헤더 기반으로 `{ id, email, name, provider }` 반환

#### 1-4. api-utils 교체
- [ ] `apps/autto/src/lib/api-utils.ts` 수정:
  - `getServerSession`, `authOptions` import 제거
  - `getSessionUser()` → `headers()`에서 `x-user-id`, `x-user-email` 등을 읽음
  - `requireAuth()`, `requireAdmin()` 시그니처 유지하되 내부 구현 교체
  - **임시 매핑 어댑터**: oauth User.id(string) → autto User.id(int)로 변환하는 함수를 둠
    ```ts
    async function getAuttoUserId(oauthUserId: string, email: string): Promise<number> {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: '', googleId: null },
      });
      return user.id;
    }
    ```
  - `requireAuth()`가 반환하는 `user` 객체에 기존 `id`(int) 그대로 노출 → 호출처는 변경 안 해도 됨

#### 1-5. Client 컴포넌트 정리
- [ ] `apps/autto/src/components/AuthProvider.tsx` 삭제 (또는 빈 fragment)
- [ ] `apps/autto/src/app/layout.tsx`에서 `AuthProvider` 제거
- [ ] `apps/autto/src/components/Dashboard.tsx` — `useSession` 제거하고 `/api/auth/me` SWR/fetch로 교체. `signOut()`는 `window.location = '{oauth}/logout?returnUrl=...'`
- [ ] `apps/autto/src/app/login/page.tsx` — `signIn('google')` 대신 `window.location = '{oauth}/login?clientId=autto&redirectUri=...'`로 즉시 리다이렉트. 또는 페이지 자체 삭제하고 미들웨어가 oauth 로 직접 보냄.

#### 1-6. next-auth 제거
- [ ] `apps/autto/src/app/api/auth/[...nextauth]/route.ts` 삭제
- [ ] `apps/autto/src/lib/auth.ts` 삭제
- [ ] `package.json`에서 `next-auth` 제거
- [ ] `next-auth/react`, `next-auth` import 잔재 검색하여 정리

#### 1-7. 환경변수 정리
- [ ] `.env.local.example` 수정 (있다면)
- [ ] 필요: `NEXT_PUBLIC_OAUTH_SERVER_URL`, `OAUTH_JWT_SECRET` (모든 polymorph 앱 공유)
- [ ] 제거: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

#### 1-8. 검증
- [ ] `pnpm --filter autto build` 성공
- [ ] `pnpm --filter autto tsc` 통과
- [ ] 로컬에서 `pnpm --filter autto dev` 실행 → autto.localhost 또는 localhost:3006 접속
- [ ] oauth-server도 로컬 실행 (`pnpm --filter oauth-server dev`)
- [ ] 로그인 흐름 확인:
  1. `localhost:3006` 접속 → 미들웨어가 oauth-server로 silent SSO
  2. oauth-server에 세션 없으면 비로그인 상태로 진입
  3. 로그인 버튼 클릭 → oauth-server `/login` 이동
  4. Google 로그인 → autto `/auth/callback`로 토큰 받고 쿠키 저장 → 홈
- [ ] 본인 계정으로 로그인 후 기존 DhAccount, 구매 이력 그대로 보이는지 확인
- [ ] admin 화면 (`/api/admin/network-test`) 정상 동작 확인
- [ ] cron 라우트 (`/api/cron/auto-purchase`)는 cron-auth로 보호되므로 영향 없음을 확인

**완료 기준**: 로컬에서 oauth-server 통합 로그인 정상 동작 + 기존 사용자 데이터 그대로 표시.

---

### Phase 2: DB 스키마 정리 — User 테이블 제거 (1일)

**목표**: autto `users` 테이블 제거, `dh_accounts.user_id`를 oauth User.id(String)로 직접 참조. 어댑터 코드 제거.

#### 2-1. 매핑 데이터 준비
- [ ] autto `users` 테이블의 모든 row를 oauth-server User로 매핑할 수 있는지 확인
  - 매핑 키: email
  - 매핑 안 되는 row가 있으면 작업 중단, 사용자에게 확인
- [ ] 매핑 결과를 다음 형태로 출력:
  ```
  autto.User.id=1, email=a@x.com → oauth.User.id=cabc123...
  autto.User.id=2, email=b@x.com → oauth.User.id=cdef456...
  ```

#### 2-2. 매핑 스크립트 작성 및 dry-run
- [ ] `apps/autto/scripts/migrate-to-oauth-user.ts` 작성:
  1. autto DB의 모든 `users` 조회
  2. 각 user의 email로 oauth-server User 조회
  3. 없으면 (Phase 1까지 한번도 oauth 로그인 안 한 사용자가 있을 수 있음) — 작업 보류, 사용자 확인 필요
  4. 결과 출력: autto_user_id → oauth_user_id 매핑 표
- [ ] `--dry-run` 옵션으로 실행, 결과 사람이 검토
- [ ] `--dry-run` 없이 실행 시 다음 작업 수행:
  - `dh_accounts`에 `oauth_user_id VARCHAR(?)` 컬럼 추가 (먼저 Prisma migration 따로)
  - 모든 row의 `oauth_user_id`를 매핑 표대로 채움
  - 채워진 row 수 = `dh_accounts` 전체 row 수인지 검증
  - 채워지지 않은 row가 있으면 중단

#### 2-3. Prisma 스키마 변경 — 단계 1 (컬럼 추가)
- [ ] `apps/autto/prisma/schema.prisma`에 임시 컬럼 추가:
  ```prisma
  model DhAccount {
    ...
    userId      Int     @map("user_id")            // 기존
    oauthUserId String? @map("oauth_user_id")      // 신규
    ...
  }
  ```
- [ ] `pnpm --filter autto db:migrate` (이름: `add_dh_account_oauth_user_id`)

#### 2-4. 매핑 스크립트 실 실행
- [ ] 2-2의 스크립트를 실모드로 실행
- [ ] `SELECT COUNT(*) FROM dh_accounts WHERE oauth_user_id IS NULL` = 0 확인
- [ ] 본인 계정으로 로컬에서 oauth_user_id 기준 조회 시 정상 동작 확인 (코드에서는 아직 userId 사용 중)

#### 2-5. Prisma 스키마 변경 — 단계 2 (FK 교체)
- [ ] autto User 테이블과 dh_accounts.userId(Int) 관계 끊고, oauth_user_id를 NOT NULL로 승격
  ```prisma
  model DhAccount {
    id          Int      @id @default(autoincrement())
    userId      String   @map("user_id")   // String으로 교체
    ...
    // user User 관계 제거 (cross-database이므로 prisma 관계 표현 불가)
    presets      LottoPreset[]
    purchaseLogs PurchaseLog[]
    @@map("dh_accounts")
  }
  // User 모델 삭제
  ```
- [ ] migration 작성 시 안전한 단계 분리:
  1. `dh_accounts.user_id` (Int) 컬럼 drop
  2. `dh_accounts.oauth_user_id`를 `user_id`로 rename + NOT NULL + VARCHAR 타입
  3. `users` 테이블 drop
- [ ] `pnpm --filter autto db:migrate --name oauth_user_id_only`
- [ ] migration SQL 사람이 직접 검토 후 실행 (raw SQL이 안전)

#### 2-6. 코드 정리 — 어댑터 제거
- [ ] `apps/autto/src/lib/api-utils.ts`의 oauth → autto userId 변환 함수 제거
- [ ] `requireAuth()`가 반환하는 `user.id`는 이제 string (oauth User.id)
- [ ] 호출처 4곳의 `user!.id` 타입을 string으로 자연스럽게 전환 (Prisma 타입이 string이라 typecheck로 강제됨)
- [ ] `apps/autto/src/lib/prisma.ts`에서 User 관련 사용처 검색하여 제거

#### 2-7. 검증
- [ ] `pnpm --filter autto tsc` 통과
- [ ] `pnpm --filter autto build` 성공
- [ ] 로컬에서 본인 계정 로그인 → DhAccount, PurchaseLog 정상 표시
- [ ] 다른 사용자(테스트 계정)로 로그인 → 다른 사용자 DhAccount는 안 보임 (격리 확인)
- [ ] DhAccount 추가 → settings API → DB 확인 시 `user_id`에 oauth User.id(string) 들어가는지 확인
- [ ] cron 라우트 dry-run 실행 → 모든 사용자 DhAccount 순회 정상 동작

**완료 기준**: autto `users` 테이블 완전 제거, 모든 FK가 oauth User.id 사용, 모든 기능 정상.

---

### Phase 3: 배포 (반나절)

**목표**: 운영 환경에 적용.

#### 3-1. 운영 DB 백업 재확인
- [ ] Phase 0 백업이 최신인지 확인 (Phase 1~2 사이에 새 데이터 들어왔으면 재백업)

#### 3-2. 운영 DB 매핑 사전 검증
- [ ] 운영 oauth-server User 테이블에 autto 사용자들이 모두 한 번 이상 oauth 로그인을 거쳐 등록되어 있는지 확인
- [ ] 안 거친 사용자가 있으면: 본인이 한 번 oauth-server에 로그인해서 User row 생성 요청
- [ ] 또는 매핑 스크립트가 oauth-server에 User 신규 생성하는 모드 추가 검토 (단, 자동 가입 형태라 신중)

#### 3-3. k8s 매니페스트 / GitHub Actions
- [ ] `polymorph-k8s/manifests/autto/secret.yaml` 수정:
  - 추가: `NEXT_PUBLIC_OAUTH_SERVER_URL`, `OAUTH_JWT_SECRET`
  - 제거: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] `.github/workflows/autto-*.yaml` 환경변수 정리
- [ ] migration 실행 전략 결정:
  - 옵션 A: 배포 전에 사람이 직접 `pnpm --filter autto db:migrate deploy` (안전)
  - 옵션 B: Docker image entrypoint나 init container에서 자동 실행 (jibsayo 방식 확인 필요)

#### 3-4. 컷오버
- [ ] 새 image 빌드 + 배포
- [ ] 배포 직후 본인 계정으로 로그인 → 정상 동작 확인
- [ ] 다른 사용자에게 신규 URL/로그인 방식 안내
- [ ] 24시간 모니터링 — 에러 로그, 사용자 문의

#### 3-5. 사후
- [ ] D+7일: PurchaseLog/구매 이력 정합성 점검 (오너 잘못 매핑된 row 없는지)
- [ ] D+30일: Phase 0 백업 파일 보관 또는 안전 폐기

**완료 기준**: 운영 환경에서 oauth 통합 로그인 정상, 기존 사용자 데이터 전부 본인에게 표시.

---

## 향후 작업 (이번 범위 외)

- **rootbeer-employee-mall에 동일 패턴 적용** (autto 작업으로 얻은 시행착오 반영)
- **oauth-server 개선**: autto 통합 중 발견한 부족한 부분 (예: User 자동 생성 모드, returnUrl 검증 강화 등)
- **next-auth/react 잔재 검색**: 다른 polymorph 앱에서 next-auth 쓰고 있는 곳 점검

---

## 진행 시 메모

- Phase 0 백업은 절대 생략 금지. 백업 파일 위치는 아래 "진행 상태 추적"에 기록
- Phase 1까지는 데이터 변경 0이라 안전. Phase 2부터 진짜 변경.
- Phase 2 매핑 스크립트는 dry-run으로 먼저 결과 확인 (사람이 눈으로 매핑 표 검증)
- Phase 2 migration은 raw SQL로 손 migration 권장 (Prisma migration이 데이터 보존을 보장 안 함)
- 푸시는 사용자 명시 요청 시에만 (자동 푸시 금지)
- 각 Phase 종료 시 사용자 확인 받고 다음 Phase 진입

---

## 진행 상태 추적

신규 에이전트는 작업 시작/완료 시 이 섹션을 업데이트한다. 이 섹션이 진행 상황의 단일 진실 원천(SSOT).

### 현재 단계
**Phase 1 코드 작업 완료 + linkedEmails 매핑 패치 적용, 로컬 e2e 재검증 대기 중**

### Phase 0: 백업 (완료: 2026-05-21)
- [x] autto DB 덤프 — `polymorph-app/.backups/autto-oauth-migration/autto-20260521-154151.sql` (Docker mysql:8 mysqldump, --single-transaction --routines --triggers --events)
- [x] oauth-server DB 덤프 — `polymorph-app/.backups/autto-oauth-migration/oauth-20260521-154151.sql`
- [x] autto 운영 사용자 목록 export — `autto-users-20260521-154151.tsv` (4명)
- [x] oauth-server 매핑 사전 확인 — `autto-oauth-mapping-20260521-154151.tsv` (매칭 0명, 빈 파일)
- [x] 시크릿 백업 — `autto.env-20260521-154151.bak`, `autto-k8s-secret-20260521-154151.yaml.bak`
- [x] .backups/는 .gitignore에 추가됨

#### Phase 0 발견 사항 (Phase 2 계획 영향)
- **autto users**: 4명 (`majac6@gmail.com`, `hannah.h@axzcorp.com`, `teru.oh@axzcorp.com`, `kimminsu31415@gmail.com`)
- **실데이터 보유**: `majac6@gmail.com` 1명만 (`dh_accounts` 1개, `lotto_presets` 5개, `purchase_logs` 3개)
- **나머지 3명**: 가입만 한 상태, dh_accounts 0개 → Phase 2 매핑에서 신경 안 써도 됨 (User row drop해도 데이터 유실 없음)
- **oauth-server 매칭**: 4명 중 **0명** 등록되어 있음 (oauth.users 총 2명, 다른 앱 가입자만)
  → **Phase 1 진행 중 사용자가 oauth 로그인 시 자동으로 oauth.User row 생성됨**. Phase 2 매핑 스크립트는 그때 매칭 시도.
  → 본인(majac6) 1명만 통합 후 oauth 로그인 한번 거치면 매핑 가능. 데이터 무손상 마이그레이션 위험 매우 낮음.

### Phase 1: oauth-server 통합 (코드 작업 완료: 2026-05-21)
- [x] 1-1. 의존성 정리 (`@polymorph/shared-auth` 추가, `next-auth` 제거)
- [x] 1-2. 미들웨어 추가 (`apps/autto/middleware.ts`, silent SSO)
- [x] 1-3. 콜백 페이지 + set-cookie/logout/me API
- [x] 1-4. api-utils 교체 (임시 어댑터 — `getSessionUser`가 헤더 읽고 autto.User upsert)
- [x] 1-5. Client 컴포넌트 정리 (AuthProvider 제거, Dashboard `useSession`→`/api/auth/me`, login 페이지 → oauth-server 리다이렉트)
- [x] 1-6. next-auth 제거 (`[...nextauth]`, `src/lib/auth.ts`, `src/types/index.ts` 삭제)
- [x] 1-7. 환경변수 정리 (`NEXT_PUBLIC_OAUTH_SERVER_URL`, `OAUTH_JWT_SECRET` 추가, `NEXTAUTH_*`, `GOOGLE_*` 제거)
- [x] tsc 통과, build 성공
- [ ] 1-8. 로컬 e2e 검증 (사용자가 수행)

#### 부수 변경
- `packages/shared-auth/package.json`에 `peerDependencies: { next: ">=14.2.0" }` 추가 — autto(next 15.5.9)와 jibsayo(next 14.2.29)가 모노레포에 공존해서 shared-auth가 어느 next NextRequest 타입을 보는지 모호했음. peerDep로 호스트 next 주입하게 함.

#### Phase 1 검증 체크리스트 (1-8)
- [ ] `pnpm --filter oauth-server dev` (포트 3007)
- [ ] `pnpm --filter autto dev` (포트 3006)
- [ ] `http://localhost:3006` 접속 → silent SSO 시도 (쿠키 없음) → 비로그인으로 `/login`
- [ ] `/login` 진입 시 oauth-server `/login?clientId=autto&redirectUri=...`로 리다이렉트 확인
- [ ] Google 로그인 → autto `/auth/callback#token=...` → `/api/auth/set-cookie` → `/` 진입
- [ ] Dashboard에 본인 정보 표시 (오른쪽 상단 이름/이메일)
- [ ] 기존 dh_accounts 데이터(majac6 1개) 정상 표시 — **autto User row가 자동 upsert되면서 새 ID로 매핑된다는 점 유의**. dh_accounts.user_id(기존 Int)는 옛 autto User.id를 가리키므로, 같은 email로 upsert된 새 user.id와 다를 수 있음 → **이 경우 데이터가 안 보임**. 검증 시점에 발견하면 다음 중 하나:
  - autto User 테이블의 majac6 row가 그대로 살아 있고 upsert로 id가 변하지 않으면 OK (upsert는 id 안 바꿈)
  - 그래도 안 보이면 dh_accounts.user_id를 수동으로 확인/조정
- [ ] 로그아웃 → 로컬 쿠키 + oauth-server SSO 세션 제거 후 홈
- [ ] cron 라우트는 영향 없음 (헤더 기반 인증 안 씀)

### Phase 2: DB 스키마 정리
- [ ] 2-1. 매핑 데이터 준비
- [ ] 2-2. 매핑 스크립트 작성 + dry-run
- [ ] 2-3. Prisma migration 단계 1 (oauth_user_id 컬럼 추가)
- [ ] 2-4. 매핑 스크립트 실 실행
- [ ] 2-5. Prisma migration 단계 2 (FK 교체, users 테이블 drop)
- [ ] 2-6. 어댑터 코드 제거
- [ ] 2-7. 로컬 검증

### Phase 3: 배포
- [ ] 3-1. 운영 DB 백업 재확인
- [ ] 3-2. 운영 매핑 사전 검증
- [ ] 3-3. k8s 매니페스트 / GitHub Actions 갱신
- [ ] 3-4. 컷오버
- [ ] 3-5. 사후 점검 (D+7, D+30)

### 진행 로그 (날짜 / 작업자 / 한 줄 요약)
- 2026-05-21: 계획 수립 완료, 작업 미착수
- 2026-05-21: Phase 0 백업 + Phase 1 코드 작업 완료
- 2026-05-21: Phase 1 검증 중 발견 — 카카오 가입 사용자의 토큰 email이 더미라 autto users.email(google)와 매핑 실패. 해결책으로 **JWT payload에 linkedEmails 추가** + autto 어댑터를 email → linkedEmails 순서 매칭으로 변경. 부수 수정: Dashboard logout URL `/logout`→`/api/logout`, `returnUrl`→`returnTo` (oauth-server에는 페이지 라우트 없고 API만 존재). api-utils의 헤더 의존을 cookies+validateToken 직접 호출로 변경 (미들웨어 matcher가 /api 제외하므로 헤더 안 붙음).

### 차단 사항 / 의문점
- (없음)

### 사용자에게 받아야 하는 것
- Phase 0 시작 시: autto MySQL 운영 DB 접근 정보, 덤프 보관 위치
- Phase 2-4 실행 직전: 매핑 결과 표 검토 승인
- Phase 3-3 시작 시: polymorph-k8s 리포 push 권한, registry 로그인 정보
- Phase 3-4 시작 시: 운영 배포 트리거 / 시점 합의

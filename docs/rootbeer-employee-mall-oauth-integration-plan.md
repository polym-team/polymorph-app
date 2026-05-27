# rootbeer-employee-mall → oauth-server 통합 계획서

작성일: 2026-05-27

---

## 🚀 신규 에이전트 시작 안내 (먼저 읽을 것)

이 문서는 rootbeer-employee-mall의 자체 인증(Google 단독)을 polymorph oauth-server 통합 인증으로 교체하는 **단독 실행 계획서**다. 이전 대화 컨텍스트 없이도 이 파일만 읽고 작업을 이어받을 수 있다.

### 작업 시작 전 필수 확인
1. **이 문서를 끝까지 읽기** — 결정 사항 / 위험 / 단계별 체크리스트 모두 파악
2. **참고 문서**:
   - `/Users/rootbeer.axz-pc/Documents/project/polymorph-app/CLAUDE.md` — polymorph 모노레포 규칙
   - `/Users/rootbeer.axz-pc/Documents/project/polymorph-app/apps/oauth-server/CLAUDE.md` — oauth 통합 가이드 (필독)
   - `/Users/rootbeer.axz-pc/Documents/project/polymorph-app/docs/autto-oauth-integration-plan.md` — 직전 유사 사례 (가장 가까운 reference). autto에서 발견된 시행착오(linkedEmails 매핑, set-cookie 미들웨어 헤더 미주입 등)는 본 계획에 이미 반영됨.
   - `/Users/rootbeer.axz-pc/Documents/project/polymorph-app/docs/kream-office-migration-plan.md` — 매핑 컬럼 방식의 다른 사례
3. **참고 디렉토리/파일**:
   - `apps/rootbeer-employee-mall/` — 작업 대상
   - `apps/autto/middleware.ts`, `apps/autto/src/app/auth/callback/`, `apps/autto/src/app/api/auth/` — 통합 reference 구현 (가장 비슷한 reference, 직전 작업)
   - `apps/jibsayo/middleware.ts`, `apps/jibsayo/src/app/auth/callback/` — 또 다른 reference
   - `packages/shared-auth/` — 인증 라이브러리

### 진행 원칙
- **각 Phase 종료 시 반드시 사용자 확인 받고 다음 Phase 진입** (자율 진행 금지)
- **Phase 0 백업은 절대 생략 금지**
- **푸시는 사용자 명시 요청 시에만**
- **현재 진행 중인 Phase는 이 문서 하단 "진행 상태 추적" 섹션에 기록**
- **argocd 부담 줄이려 분리 커밋**: 대규모 변경은 영향 단위로 쪼개 커밋. 매 커밋 후 사용자 운영 확인 시간 확보.

### 시작 위치
- 아직 시작 전 → "Phase 0: 백업"부터
- 진행 중 → "진행 상태 추적" 섹션의 마지막 항목 참고

---

## 개요

`apps/rootbeer-employee-mall`은 현재 자체 next-auth(Google) 인증 + 자체 `User` 테이블을 사용 중이다. 이를 polymorph oauth-server 통합 인증으로 교체한다.

- 운영 도메인: `rootbeer-employee-mall.polymorph.co.kr` (예상, k8s 매니페스트에서 실제 확인 필요)
- 로컬 포트: `3005`
- 사용자 수: 임직원 다수 (autto와 달리 운영 사용자가 여러 명). **승인 워크플로우(pending/user/admin) 보존 필요**.
- ClientApp 등록: **미등록** → `apps/oauth-server/prisma/seed.ts`에 추가 필요

핵심 키워드:
1. **자체 `users` 테이블 제거 + FK(`orders.user_id`)를 oauth User.id(string)로 직접 교체** (autto 패턴 답습)
2. **role/filter_preset/표시용 캐시는 신규 `employee_profiles` 테이블로 이관** (PK = oauth User.id)
3. **관리자(role=admin)가 신규 가입자(pending) 승인하는 워크플로우 보존**

---

## 결정 사항

| 항목 | 결정 | 근거 |
|---|---|---|
| User 매핑 방식 | rootbeer `users` 테이블 제거, FK는 oauth User.id(String) 직접 참조 | autto와 동일 — 부채로 남는 매핑 컬럼을 만들지 않음. 사용자가 "동작만 잘 되면 autto 패턴이 좋다"고 명시. |
| role/profile 보관 | 신규 `employee_profiles` 테이블 (`oauth_user_id` PK) | 승인 워크플로우(pending/user/admin)가 핵심 기능이라 ADMIN_EMAIL만으로는 부족. 사용자 명/이메일은 oauth-server JWT 헤더에서 받지만, 정산(settlement) 화면 등 "다른 사용자 표시"에는 캐시가 필요해 name/email 컬럼 포함. |
| filterPreset 보관 | `employee_profiles.filter_preset`로 이관 | 사용자별 1개 텍스트 필드라 employee_profiles에 통합. |
| Admin 권한 판정 | DB의 `employee_profiles.role === 'admin'`로 판정 (ADMIN_EMAIL 환경변수는 **시드용**으로만 사용) | 자체 인증 시절과 동일한 동작. 관리자 화면에서 다른 사용자 role 변경 가능해야 함. |
| 신규 가입자 초기 role | 첫 로그인 시 `employee_profiles` upsert. `ADMIN_EMAIL` 일치면 admin, 그 외는 `pending`. | 자체 인증 시절 `auth.ts`의 signIn 콜백 로직을 그대로 옮김. |
| 사용자 데이터 매핑 키 | oauth-server에서 JWT payload로 받는 `email` + `linkedEmails`(없으면 빈 배열) 우선 매핑, fallback 없음 | autto에서 검증된 패턴. 카카오 단독 가입 사용자는 이메일이 더미라 google 이메일로 등록된 rootbeer users와 매핑 안 됨 → linkedEmails(연동된 모든 account.email 배열)를 활용. |
| 매핑 스크립트 | dry-run 모드 우선 → 결과 검토 후 실 실행 | rootbeer는 autto(2~5명)보다 사용자 수 많아 매핑 실수 시 격리 위반 위험 큼. |
| oauth-server JWT 변경 | **없음** (autto 작업 때 `linkedEmails` 이미 추가됨) | 본 작업으로 oauth-server 코드는 변경 없음. seed에 ClientApp만 추가. |
| 컷오버 | 사전 공지 후 컷오버 (배포 직전 사내 슬랙 등에 안내) | autto는 본인 1명이라 무공지였지만, rootbeer는 다수라 로그인 흐름 변경 사실 사전 공지 필요. |
| 점검 윈도우 | Phase 2 시작 ~ Phase 3 종료를 **단일 점검 윈도우**로 묶음 | local-dev와 prod가 **공유 DB**라 Phase 2(스키마 변경) 순간부터 운영 코드가 깨짐. Phase 2 → Phase 3 사이에 운영을 열어둘 수 없음. `apps/maintenance` 앱을 ingress backend로 스왑해 점검 모드 운영. |

---

## 점검 모드 운영

shared DB이므로 Phase 2(스키마 변경)~Phase 3(신규 이미지 배포)를 단일 점검 윈도우로 운영한다. `apps/maintenance` 앱을 활용한다.

- 인프라 사전 준비: `polymorph-k8s/manifests/maintenance/`에 deployment + service + ExternalName 참조 절차 README 존재
- 활성화 방식: 표준 k8s Ingress는 cross-namespace 불가 → 대상 앱 namespace에 `maintenance-svc` ExternalName Service 두고 ingress backend를 스왑

### 진입 절차 (Phase 2 시작 직전)
1. `polymorph-k8s/manifests/rootbeer-employee-mall/maintenance-svc.yaml` 추가:
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: maintenance-svc
     namespace: rootbeer-employee-mall
   spec:
     type: ExternalName
     externalName: maintenance-svc.maintenance.svc.cluster.local
     ports:
       - port: 80
         targetPort: 3000
   ```
2. `polymorph-k8s/manifests/rootbeer-employee-mall/ingress.yaml`의 `backend.service.name`을 `rootbeer-employee-mall-svc` → `maintenance-svc`로 변경
3. 한 커밋으로 묶어 push → argocd 자동 sync
4. `rootbeer-employee-mall.polymorph.co.kr` 접속 시 503 + "임직원몰 점검 중" 페이지 노출 확인

### 해제 절차 (Phase 3 컷오버 검증 후)
1. `polymorph-k8s/manifests/rootbeer-employee-mall/ingress.yaml` 원복 (backend를 `rootbeer-employee-mall-svc`로)
2. (선택) `maintenance-svc.yaml` 삭제 (재사용 위해 두고 가도 무방)
3. push → argocd 자동 sync
4. 본인 계정으로 정상 로그인 + 주문 표시 확인

### 사전 공지
- D-1 사내 슬랙 공지: "임직원몰 통합 인증 전환으로 인해 {시작 시각}~{종료 예상} 동안 점검합니다"
- 점검 시간 예상: 30분~1시간 (스키마 마이그레이션 + 매핑 스크립트 + 신규 이미지 배포)

상세 인프라 README: `polymorph-k8s/manifests/maintenance/README.md`

---

## 현재 상태 분석

### rootbeer-employee-mall 기술 스택
- Next.js 15.3 + React 19 + TypeScript 5.7
- 패키지 매니저: pnpm workspace
- DB: MySQL (Prisma 6) — `src/generated/prisma`에 클라이언트 생성
- 로컬 포트: 3005

### rootbeer 인증 현재 구조 (제거 대상)
- `src/lib/auth.ts` — next-auth GoogleProvider + 자체 signIn/session 콜백 (User upsert, role 결정)
- `src/app/api/auth/[...nextauth]/route.ts` — next-auth 핸들러
- `src/app/login/page.tsx` — 자체 로그인 페이지 (`signIn('google')`)
- `src/components/AuthProvider.tsx` — `SessionProvider` 래퍼
- `src/components/BottomNav.tsx` — `useSession` 사용 (로그인 상태/role 표시)
- `src/lib/api-utils.ts` — `getSessionUser`, `requireAuth`(role !== pending 체크), `requireAdmin`(email === ADMIN_EMAIL 체크)
- `src/types/next-auth.d.ts` — Session 타입 확장 (id: number, role 등)
- `src/types/index.ts` — `ADMIN_EMAIL = 'majac6@gmail.com'`

### Prisma 스키마 현재 (`apps/rootbeer-employee-mall/prisma/schema.prisma`)
```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  name         String
  profileImage String?  @map("profile_image")
  googleId     String?  @unique @map("google_id")
  role         UserRole @default(pending)
  filterPreset String?  @map("filter_preset") @db.Text
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  orders       Order[]
  @@map("users")
}

model Order {
  id     Int @id @default(autoincrement())
  roundId Int @map("round_id")
  userId  Int @map("user_id")   // ← 변경 대상
  ...
  user User @relation(fields: [userId], references: [id])
  @@unique([roundId, userId])
  @@map("orders")
}
```

`OrderItem`, `Purchase`, `PurchaseItem`은 모두 `Order.id` / `Product.id` 기반이라 직접 영향 없음 (Order만 잘 옮기면 자동으로 따라옴).

### 신규 도입 스키마

```prisma
enum UserRole {
  pending
  user
  admin
}

model EmployeeProfile {
  oauthUserId  String   @id @map("oauth_user_id") @db.VarChar(64)  // oauth User.id (cuid), cross-DB라 Prisma 관계 표현 안 함
  email        String   @unique                                      // 캐시 (정산 화면 표시용)
  name         String                                                // 캐시 (정산 화면 표시용)
  role         UserRole @default(pending)
  filterPreset String?  @map("filter_preset") @db.Text
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  @@map("employee_profiles")
}

model Order {
  ...
  userId String @map("user_id") @db.VarChar(64)  // String FK (oauth User.id)
  // user 관계 제거 (cross-DB)
  ...
}
```

**주의**: oauth.User.id는 cuid(String)다. VarChar 길이는 cuid 25자보다 여유 둬서 64로 통일. autto에서도 동일 패턴.

### oauth-server 측 준비 상태
- ❌ `apps/oauth-server/prisma/seed.ts`에 `rootbeer-employee-mall` ClientApp **미등록** → Phase 1에서 추가
- ✅ `packages/shared-auth` 사용 가능 (autto/jibsayo에서 검증됨)
- ✅ JWT payload에 `linkedEmails` 포함됨 (autto 작업 중 추가)
- ✅ oauth-server `User.id`는 cuid (String)

### 영향 받는 호출 지점 (수정 대상 파일)

**서버 (API):**
- `src/app/api/orders/route.ts` — `requireAuth()` + `user!.id` 3곳
- `src/app/api/orders/[id]/route.ts` — `user!.id` 1곳
- `src/app/api/rounds/route.ts` — auth 사용
- `src/app/api/rounds/[id]/route.ts` — settlement 정보 가공 (`order.user.id`, `order.user.email`)
- `src/app/api/rounds/[id]/items/route.ts`
- `src/app/api/rounds/[id]/purchases/route.ts`
- `src/app/api/rounds/[id]/settlement/route.ts` — `order.user.email` 사용
- `src/app/api/users/route.ts` — `requireAdmin()`, GET/PATCH (사용자 목록/role 변경) → **employee_profiles 기반으로 재작성**
- `src/app/api/users/filter-preset/route.ts` — `user!.id`로 본인 filter_preset GET/PATCH
- `src/app/api/products/route.ts`, `[id]/route.ts` — auth 사용
- `src/app/api/notices/route.ts`, `[id]/route.ts` — auth 사용
- `src/app/api/scrape/route.ts`, `product-detail/route.ts`, `notice/route.ts` — admin 권한
- `src/app/api/auth/[...nextauth]/route.ts` — **삭제**
- `src/app/api/cron/**/route.ts` — 세션 무관 (cron-auth로 보호) → 영향 없음 확인만

**클라이언트:**
- `src/app/layout.tsx` — `AuthProvider` 제거
- `src/components/AuthProvider.tsx` — **삭제**
- `src/components/BottomNav.tsx` — `useSession` 제거, `/api/auth/me` 사용
- `src/app/login/page.tsx` — `signIn('google')` 대신 `window.location = '{oauth}/login?clientId=rootbeer-employee-mall&redirectUri=...'`
- `src/app/admin/users/page.tsx` — `User` 타입 사용 → `EmployeeProfile` 타입으로 변경 (id가 string이 됨)
- `src/app/page.tsx`, `cart/page.tsx`, `my-orders/page.tsx`, `notices/page.tsx`, `notices/[id]/page.tsx`, `products/[id]/page.tsx` — `useSession` 사용처 점검
- `src/types/next-auth.d.ts` — **삭제**
- `src/types/index.ts` — `User` re-export 제거, `EmployeeProfile` 추가, `ADMIN_EMAIL`은 시드용으로만 유지

---

## 핵심 위험: 데이터 매핑 오류 + 격리 위반

`orders.user_id` FK 타입을 Int → String으로 바꾸는 작업이 핵심 위험. 매핑이 잘못되면 **사용자 A의 주문/장바구니/정산을 B가 보게 됨**. autto와 달리 rootbeer는 사용자가 다수라 잘못된 매핑 1건의 파급력이 더 큼.

**방어 수칙:**
1. Phase 0에서 DB 덤프 확보 (롤백 가능 상태)
2. Phase 0에서 dry-run 사전 매핑 결과 export → 매핑 안 되는 사용자 사전에 식별
3. 매핑 안 되는 사용자가 있으면 **사전에 oauth-server로 한 번 로그인 요청** (linkedEmails에 등록되도록)
4. Phase 2 매핑 스크립트도 dry-run 우선
5. Phase 2 마이그레이션은 신규 컬럼(`oauth_user_id`) 추가 → 데이터 채움 → 검증 → 그 다음에 기존 `user_id`(Int) drop. 한 번에 안 함.
6. 매핑 실패한 row가 1개라도 있으면 작업 중단

---

## 4단계 실행 계획

### Phase 0: 백업 + 사전 매핑 검증 (1~2시간)

**목표**: 어떤 일이 있어도 데이터 복원 가능한 상태 확보. **매핑 안 되는 사용자 사전 식별**.

#### 0-1. DB 덤프
- [ ] rootbeer-employee-mall DB 전체 덤프 (`mysqldump`) → `polymorph-app/.backups/rootbeer-mall-oauth-migration/` 저장
  - 대상 테이블: `users`, `orders`, `order_items`, `order_rounds`, `purchases`, `purchase_items`, `products`, `product_details`, `product_options`, `notices`
  - 옵션: `--single-transaction --routines --triggers --events`
- [ ] oauth-server DB 덤프 (스키마 변경 없지만 매핑 결과 검증용)

#### 0-2. 사용자 export + 사전 매핑 dry-run
- [ ] rootbeer 운영 사용자 목록 export:
  ```sql
  SELECT id, email, name, google_id, role, created_at FROM users ORDER BY id;
  ```
  → `rootbeer-users-{date}.tsv`로 저장
- [ ] oauth-server 측 매칭 dry-run:
  ```sql
  -- oauth DB에서 (account.email까지 포함하여 linkedEmails 매칭 시뮬레이션)
  SELECT
    u.id AS oauth_user_id,
    u.email AS oauth_user_email,
    GROUP_CONCAT(DISTINCT a.email) AS linked_emails
  FROM users u
  LEFT JOIN accounts a ON a.user_id = u.id
  GROUP BY u.id;
  ```
  → 이 결과와 rootbeer-users를 조인하여 매칭 가능 여부 표 작성 → `rootbeer-oauth-mapping-{date}.tsv`
- [ ] 매핑 결과 검토:
  - 매핑 성공 (1:1) → 진행 가능
  - 매핑 실패 (oauth에 해당 이메일 가입자 없음) → **사용자에게 "rootbeer-employee-mall 컷오버 전 oauth.polymorph.co.kr 한 번 로그인 부탁" 안내 필요**. Phase 1 들어가기 전에 모두 해결.
  - 매핑 다중 (rootbeer 1명 ↔ oauth 여러 명) → 중단, 사람이 결정

#### 0-3. 시크릿 백업
- [ ] `NEXTAUTH_SECRET` (제거 예정이지만 백업)
- [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (rootbeer에서는 제거됨. oauth-server가 사용)
- [ ] `.env.local`, k8s secret yaml 백업

#### 0-4. 사전 공지 (선택)
- [ ] 사용자 수에 따라 사내 슬랙 등에 사전 공지 검토 (D-3 시점)

**완료 기준**: 덤프 파일 손에 있고, 매핑 결과 표가 모두 ✓(또는 oauth 사전 로그인 안내 진행 중)이며, 복원 명령어 1줄로 설명 가능.

---

### Phase 1: oauth-server 통합 (1~2일)

**목표**: 자체 인증 제거, oauth-server JWT 쿠키 기반으로 전환. DB 스키마는 아직 안 건드림 (Phase 2에서 변경). 단, role 데이터 보존을 위해 `employee_profiles` 테이블은 미리 만들고 **users 테이블과 병행 운영**.

이 Phase 끝나면 **로그인은 oauth-server로 일원화되고, role 판정은 employee_profiles로 옮겨가지만, rootbeer DB의 `users` 테이블과 `orders.user_id`(Int)는 여전히 존재**. rootbeer 코드 내부에서 oauth User.id → rootbeer User.id 매핑을 거치는 임시 상태.

#### 1-1. oauth-server seed 등록
- [ ] `apps/oauth-server/prisma/seed.ts`에 `rootbeer-employee-mall` ClientApp 추가:
  ```ts
  {
    clientId: 'rootbeer-employee-mall',
    name: '임직원몰',
    allowedRedirectUris: [
      'http://localhost:3005/auth/callback',
      'https://rootbeer-employee-mall.polymorph.co.kr/auth/callback',  // 실제 운영 도메인으로 확인 필요
    ].join(','),
    accessTokenLifetime: 60 * 60 * 24 * 7, // 7일
  }
  ```
- [ ] `pnpm --filter oauth-server db:seed` (로컬)
- [ ] 운영 oauth DB에도 seed 반영 (배포 시점 Phase 3)

#### 1-2. 의존성 정리
- [ ] `apps/rootbeer-employee-mall/package.json`에 `@polymorph/shared-auth: workspace:*` 추가
- [ ] `next-auth` 의존성은 Phase 1 마지막에 제거
- [ ] `pnpm install`

#### 1-3. employee_profiles 테이블 신설 (Prisma migration 1단계)
- [ ] `apps/rootbeer-employee-mall/prisma/schema.prisma`에 `EmployeeProfile` 모델 추가 (위 "신규 도입 스키마" 참조)
- [ ] `pnpm --filter rootbeer-employee-mall db:migrate --name add_employee_profiles`
- [ ] **이 시점에는 비어 있음**. 사용자가 oauth 로그인할 때마다 upsert로 채움.

#### 1-4. 미들웨어 추가
- [ ] `apps/rootbeer-employee-mall/middleware.ts` 작성 (autto middleware.ts 복제 후 `CLIENT_ID = 'rootbeer-employee-mall'`)
  - `onUnauthenticated: 'silent'`
  - matcher에서 `/api`, `/_next/*`, `/auth/callback` 등 제외
  - 단, `/api/auth/*` (set-cookie/logout/me)는 미들웨어 통과시키지 않음 (헤더 주입 안 됨, autto에서 발견된 이슈)

#### 1-5. 콜백 페이지 및 인증 API
- [ ] `src/app/auth/callback/page.tsx` 작성 (autto CallbackClient 복제)
- [ ] `src/app/auth/callback/CallbackClient.tsx`
- [ ] `src/app/api/auth/set-cookie/route.ts` 작성 (autto 복제)
- [ ] `src/app/api/auth/logout/route.ts` 작성
- [ ] `src/app/api/auth/me/route.ts` 작성 — JWT 검증 후 `{ id, email, name, provider, role }` 반환. **role은 employee_profiles에서 조회 + 없으면 upsert(pending 또는 admin)**.

#### 1-6. api-utils 교체 (임시 어댑터 포함)
- [ ] `src/lib/api-utils.ts` 재작성:
  - `getServerSession`, `authOptions` import 제거
  - `getSessionUser()`: cookies + `validateToken` 직접 호출 (미들웨어 헤더 주입에 의존 X — autto에서 `/api` 라우트는 미들웨어 matcher 제외라 헤더 없는 이슈 발견됨)
  - 토큰 payload에서 `id`(oauth User.id), `email`, `name`, `linkedEmails` 추출
  - **role 판정 + employee_profile upsert**:
    ```ts
    async function ensureEmployeeProfile(oauthUserId: string, email: string, name: string) {
      const isAdmin = email === ADMIN_EMAIL;
      return prisma.employeeProfile.upsert({
        where: { oauthUserId },
        update: { email, name },  // role은 갱신 X (관리자 변경 보존)
        create: {
          oauthUserId, email, name,
          role: isAdmin ? 'admin' : 'pending',
        },
      });
    }
    ```
  - **임시 매핑 어댑터** (Phase 1만): oauth User.id(string) → rootbeer User.id(int)로 변환
    ```ts
    async function getLegacyUserId(oauthUserId: string, email: string, linkedEmails: string[]): Promise<number> {
      // 1. email로 기존 rootbeer user 찾기
      // 2. 없으면 linkedEmails로 차례로 찾기
      // 3. 없으면 새 row 생성 (신규 가입자)
      const allEmails = [email, ...linkedEmails].filter(Boolean);
      const existing = await prisma.user.findFirst({ where: { email: { in: allEmails } } });
      if (existing) return existing.id;
      const created = await prisma.user.create({
        data: { email, name: '', googleId: null, role: 'pending' },
      });
      return created.id;
    }
    ```
  - `requireAuth()`가 반환하는 `user` 객체:
    ```ts
    { id: number /* rootbeer user.id 임시 */, oauthId: string, email: string, name: string, role: UserRole }
    ```
    호출처는 `user.id`(int)를 그대로 쓸 수 있게 함 → Phase 1 끝나면 동작 동일.
  - `requireAuth()`: role !== 'pending' 검사 (`employee_profiles.role` 기준)
  - `requireAdmin()`: `employee_profiles.role === 'admin'` 검사

#### 1-7. Client 컴포넌트 정리
- [ ] `src/components/AuthProvider.tsx` 삭제
- [ ] `src/app/layout.tsx`에서 `AuthProvider` 제거
- [ ] `src/components/BottomNav.tsx` — `useSession` 제거, `/api/auth/me` SWR/fetch로 교체
- [ ] `src/app/login/page.tsx` — `signIn('google')` 대신 `window.location = '{oauth}/login?clientId=rootbeer-employee-mall&redirectUri=...'`로 즉시 리다이렉트
- [ ] 페이지(`page.tsx`, `cart/page.tsx`, `my-orders/page.tsx`, `products/[id]`, `notices/*`)에 `useSession` 잔재가 있다면 정리
- [ ] `src/app/admin/users/page.tsx`:
  - `User` 타입을 임시로 그대로 사용 가능 (id가 아직 int)
  - 단, 표시되는 사용자 목록은 `users` 테이블 기준이 아닌 **`employee_profiles` 기준**으로 바뀌어야 함 → API GET 변경 시점에 같이
  - **Phase 1 시점**: 화면 동작 유지를 위해 일단 users 테이블 그대로 사용 OK. Phase 2에서 employee_profiles로 전환.

#### 1-8. API GET `/api/users` (admin) 변경
- [ ] `src/app/api/users/route.ts`:
  - GET: `employee_profiles` 기준으로 사용자 목록 반환 (`oauth_user_id`, `email`, `name`, `role` 포함)
  - PATCH: `oauthUserId` + `role`로 role 변경 (기존 userId(int) → oauthUserId(string))
- [ ] `src/app/admin/users/page.tsx`도 함께 수정 (id 필드 string, key/handler 변경)

#### 1-9. next-auth 제거
- [ ] `src/app/api/auth/[...nextauth]/route.ts` 삭제
- [ ] `src/lib/auth.ts` 삭제
- [ ] `src/types/next-auth.d.ts` 삭제
- [ ] `package.json`에서 `next-auth` 제거
- [ ] `next-auth`, `next-auth/react` import 잔재 검색하여 정리

#### 1-10. 환경변수 정리
- [ ] `.env.local.example` 갱신
- [ ] 필요: `NEXT_PUBLIC_OAUTH_SERVER_URL`, `OAUTH_JWT_SECRET` (모든 polymorph 앱 공유)
- [ ] 제거: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] `ADMIN_EMAIL`은 코드 상수(`src/types/index.ts`)에 그대로 유지 (시드용)

#### 1-11. 검증
- [ ] `pnpm --filter rootbeer-employee-mall tsc` 통과
- [ ] `pnpm --filter rootbeer-employee-mall build` 성공
- [ ] 로컬 e2e:
  - oauth-server (`pnpm --filter oauth-server dev`, 3007) + rootbeer (`pnpm --filter rootbeer-employee-mall dev`, 3005) 동시 실행
  - `localhost:3005` 접속 → silent SSO → 비로그인 진입
  - `/login` → oauth-server `/login?clientId=rootbeer-employee-mall&...` 리다이렉트 확인
  - Google 로그인 → `/auth/callback#token=...` → `/api/auth/set-cookie` → `/` 진입
  - BottomNav에 본인 정보 표시
  - **본인 계정**(`majac6@gmail.com`)으로 로그인 → 자동으로 employee_profiles.role = 'admin' 부여 확인
  - 본인 계정 → 기존 주문(my-orders) 그대로 보이는지 확인 ※
  - 다른 사용자로 로그인 → role = 'pending' 부여, requireAuth에서 차단 (403) 확인
  - admin 화면 `/admin/users`에서 다른 사용자 role 'user'로 변경 → 다시 로그인 → 정상 접근
  - 로그아웃 → 쿠키 + oauth-server SSO 세션 제거
  - cron 라우트 (`/api/cron/*`)는 영향 없음 (cron-auth)

  ※ 주의: legacy 매핑 어댑터는 email/linkedEmails로 `users` row를 찾으므로, 본인이 자체 인증으로 만든 row가 이메일 동일성으로 매칭되어야 함. 매칭 실패 시 새 row가 생성되어 기존 주문이 안 보일 수 있음. 이 경우 SQL로 직접 user.email 정합성 확인.

**완료 기준**: 로컬에서 oauth-server 통합 로그인 정상, 기존 사용자가 본인 주문 그대로 표시, role 워크플로우(pending/user/admin) 정상 동작.

---

### Phase 2: DB 스키마 정리 — User 테이블 제거 (점검 윈도우 내, 30분~1시간)

**목표**: rootbeer `users` 테이블 제거, `orders.user_id`를 oauth User.id(String)로 직접 참조. Phase 1의 임시 매핑 어댑터 제거.

**중요**: shared DB라 이 Phase 시작 = 운영 코드 깨짐. 반드시 위 "점검 모드 운영"의 진입 절차를 먼저 수행하고 시작.

#### 2-0. 점검 모드 진입
- [ ] D-1 사내 공지 발송 완료 확인
- [ ] `polymorph-k8s`에 `maintenance-svc.yaml` 추가 + `ingress.yaml` 스왑 커밋 + push
- [ ] argocd sync 완료 확인 (Application Healthy)
- [ ] `rootbeer-employee-mall.polymorph.co.kr` 접속 → 503 "임직원몰 점검 중" 페이지 노출 확인

#### 2-1. 매핑 데이터 준비
- [ ] rootbeer `users` 테이블의 모든 row를 oauth User로 매핑 가능한지 재확인
  - 매핑 키: email → linkedEmails → fail
  - 매핑 안 되는 row가 있으면 작업 중단, 사용자에게 확인 (Phase 0에서 사전 확인했지만 신규 가입자가 추가됐을 수 있음)
- [ ] 매핑 결과를 다음 형태로 출력:
  ```
  rootbeer.User.id=1, email=a@x.com → oauth.User.id=cabc123...
  rootbeer.User.id=2, email=b@x.com → oauth.User.id=cdef456...
  ```

#### 2-2. 매핑 스크립트 작성 및 dry-run
- [ ] `apps/rootbeer-employee-mall/scripts/migrate-to-oauth-user.ts` 작성:
  1. rootbeer DB의 모든 `users` 조회
  2. 각 user의 email로 oauth-server User 조회 + linkedEmails 매칭
  3. 매핑 표 출력
  4. dry-run 모드 + 실 모드 분리
- [ ] `--dry-run` 실행, 결과 사람이 검토
- [ ] 매칭 안 된 row 0건 확인

#### 2-3. Prisma 스키마 변경 — 단계 1 (임시 컬럼 추가)
- [ ] `schema.prisma`에 임시 컬럼 추가:
  ```prisma
  model Order {
    ...
    userId      Int     @map("user_id")            // 기존 (int)
    oauthUserId String? @map("oauth_user_id") @db.VarChar(64)  // 신규
    @@unique([roundId, userId])  // 일단 유지
    ...
  }
  ```
- [ ] `pnpm --filter rootbeer-employee-mall db:migrate --name add_order_oauth_user_id`

#### 2-4. 매핑 스크립트 실 실행
- [ ] 2-2의 스크립트를 실모드로 실행:
  - `orders` 전체 row를 매핑 표대로 `oauth_user_id` 채움
  - `SELECT COUNT(*) FROM orders WHERE oauth_user_id IS NULL` = 0 확인
  - 매핑 안 된 row 있으면 중단
- [ ] 본인 계정으로 로컬에서 oauth_user_id 기준 조회 시 정상 동작 확인 (코드에서는 아직 userId 사용 중이지만 SQL 직접 검증)

#### 2-5. Prisma 스키마 변경 — 단계 2 (FK 교체, users 테이블 drop)
- [ ] 안전한 순서로 raw SQL migration 작성 (Prisma migration이 데이터 보존을 보장 안 함 → 손 마이그레이션 권장):
  1. `orders` 테이블의 `user_id`(Int) FK 제약/인덱스 drop
  2. `orders.user_id` 컬럼 drop
  3. `orders.oauth_user_id`를 `user_id`로 rename + NOT NULL + VARCHAR(64) 타입
  4. `@@unique([roundId, userId])` 인덱스 재생성 (String 기준)
  5. `users` 테이블 drop
- [ ] schema.prisma 최종:
  ```prisma
  model Order {
    id     Int    @id @default(autoincrement())
    roundId Int   @map("round_id")
    userId  String @map("user_id") @db.VarChar(64)  // oauth User.id
    ...
    round OrderRound @relation(fields: [roundId], references: [id])
    items OrderItem[]
    @@unique([roundId, userId])
    @@map("orders")
  }
  // User 모델 삭제
  ```
- [ ] `prisma migrate dev` 대신 raw SQL로 migration 파일 작성 + Prisma client 재생성:
  ```
  apps/rootbeer-employee-mall/prisma/migrations/{ts}_oauth_user_id_only/migration.sql
  ```
- [ ] migration SQL 사람이 직접 검토 후 실행

#### 2-6. 코드 정리 — 어댑터 제거
- [ ] `src/lib/api-utils.ts`의 `getLegacyUserId` 함수 제거
- [ ] `requireAuth()` 반환 user 타입 변경: `id: number` → `id: string` (oauth User.id)
- [ ] 호출처 모두 점검:
  - `orders/route.ts`, `orders/[id]/route.ts`: `user!.id`가 자연스럽게 string
  - `users/filter-preset/route.ts`: filterPreset이 `employee_profiles` 기준으로 옮겨졌는지 확인 (Phase 1-6에서 옮겼다면 string id로 조회)
  - `rounds/[id]/route.ts`, `rounds/[id]/settlement/route.ts`: settlement 가공에서 `order.user.email` 더이상 사용 불가 (관계 제거) → `employee_profiles`에서 email/name JOIN하거나 별도 조회로 변경
- [ ] `src/types/index.ts`에서 `User` re-export 제거
- [ ] `SettlementRow.user_id` 타입 number → string

#### 2-7. 검증
- [ ] `pnpm --filter rootbeer-employee-mall tsc` 통과 (id 타입 변경에 따른 typecheck로 강제됨)
- [ ] `pnpm --filter rootbeer-employee-mall build` 성공
- [ ] 로컬에서 본인 계정 로그인 → 주문, 정산, filter preset 정상 표시
- [ ] 다른 사용자로 로그인 → 본인 주문만 보임 (격리 확인)
- [ ] 새 주문 생성 → DB 확인 시 `orders.user_id`에 oauth User.id(string) 들어가는지 확인
- [ ] admin 화면 → role 변경 정상 동작
- [ ] cron 라우트 영향 없음 재확인

**완료 기준**: rootbeer `users` 테이블 완전 제거, 모든 FK가 oauth User.id 사용, role 워크플로우 정상, 모든 기능 정상.

---

### Phase 3: 배포 (반나절)

**목표**: 운영 환경에 적용.

#### 3-1. 운영 DB 백업 재확인
- [ ] Phase 0 백업이 최신인지 확인 (Phase 1~2 사이에 새 데이터 들어왔으면 재백업)

#### 3-2. 운영 oauth-server seed 반영
- [ ] `apps/oauth-server/prisma/seed.ts` 변경분 운영 적용 (`pnpm --filter oauth-server db:seed deploy` 또는 동일 방식)
- [ ] 운영 oauth DB에 `rootbeer-employee-mall` ClientApp 등록 확인

#### 3-3. 운영 DB 매핑 사전 재검증
- [ ] 운영 oauth-server User에 rootbeer 사용자들이 모두 등록되어 있는지 다시 확인
- [ ] 안 거친 사용자가 있으면: 본인에게 `oauth.polymorph.co.kr` 한 번 로그인 요청
- [ ] 매핑 표 최종 검토

#### 3-4. k8s 매니페스트 / GitHub Actions
- [ ] `polymorph-k8s/manifests/rootbeer-employee-mall/secret.yaml` 수정:
  - 추가: `NEXT_PUBLIC_OAUTH_SERVER_URL`, `OAUTH_JWT_SECRET`
  - 제거: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] `.github/workflows/rootbeer-employee-mall-*.yaml` 환경변수 정리
- [ ] migration 실행 전략: autto와 동일하게 사람이 직접 운영 DB에 `prisma migrate deploy` (안전)

#### 3-5. 컷오버 (점검 윈도우 내)
- [ ] 사전 공지는 Phase 2-0에서 이미 발송됨
- [ ] 새 image 빌드 + 배포 (argocd 부담 줄이려 [[project_deploy_split_commits]] 원칙대로 분할 커밋·푸시)
- [ ] 새 이미지 pod Ready 확인 (`kubectl get pods -n rootbeer-employee-mall`)
- [ ] **점검 모드 해제**: `polymorph-k8s/manifests/rootbeer-employee-mall/ingress.yaml` 원복 커밋 + push → argocd sync
- [ ] 배포 직후 본인 계정으로 로그인 → 정상 동작 확인 (oauth-server SSO → 임직원몰 → 본인 주문 표시)
- [ ] 다른 사용자에게 정상화 알림 + 본인 주문 보이는지 확인 요청
- [ ] 24시간 모니터링 — 에러 로그, 사용자 문의

#### 3-6. 사후
- [ ] D+3일: 정산(settlement) 계산 정합성 점검 (사용자별 합계가 자체 인증 시절과 동일한지)
- [ ] D+7일: 주문 이력 정합성 점검 (오너 잘못 매핑된 row 없는지)
- [ ] D+30일: Phase 0 백업 파일 보관 또는 안전 폐기
- [ ] 자체 인증 시절 Google OAuth 클라이언트 (Google Cloud Console) — rootbeer 전용이었다면 disable/삭제

**완료 기준**: 운영 환경에서 oauth 통합 로그인 정상, 모든 임직원 본인 주문/정산 정상 표시, role 워크플로우 정상.

---

## 향후 작업 (이번 범위 외)

- **employee_profile 확장**: 부서/연락처 등 추가 필요 시 이 테이블에 컬럼 추가
- **다른 polymorph 앱 점검**: next-auth 잔재 검색하여 통합 대상 식별 (collab, donghaeng, okra 등)
- **oauth-server 개선**: 본 작업 중 발견한 부족한 부분이 있으면 이슈 등록

---

## 진행 시 메모

- Phase 0 백업은 절대 생략 금지. 백업 파일 위치는 아래 "진행 상태 추적"에 기록
- Phase 1까지는 DB 데이터 변경 0 (employee_profiles는 신규 채움, users는 그대로). Phase 2부터 진짜 변경.
- Phase 2 매핑 스크립트는 dry-run으로 먼저 결과 확인 (사람이 눈으로 매핑 표 검증)
- Phase 2 migration은 raw SQL로 손 migration 권장 (Prisma migration이 데이터 보존을 보장 안 함)
- 푸시는 사용자 명시 요청 시에만 (자동 푸시 금지) — [[feedback_push]]
- 각 Phase 종료 시 사용자 확인 받고 다음 Phase 진입
- argocd 부담 줄이려 영향 단위로 커밋 분할 — [[project_deploy_split_commits]]
- autto 통합 시 발견된 함정 미리 회피:
  - `/api/*` 라우트는 미들웨어 matcher에서 제외 → api-utils에서 cookies + validateToken 직접 호출
  - 로그아웃 URL: oauth-server는 페이지 라우트 없고 API만 존재 → `/api/logout?returnTo=...` 사용
  - 카카오 등 이메일 없는 provider 대응: JWT의 `linkedEmails`로 매핑 fallback
  - shared-auth가 host next 사용하도록 `peerDependencies.next` 활용

---

## 진행 상태 추적

신규 에이전트는 작업 시작/완료 시 이 섹션을 업데이트한다. 이 섹션이 진행 상황의 단일 진실 원천(SSOT).

### 현재 단계
**계획 수립 완료, 작업 미착수**

### Phase 0: 백업 + 사전 매핑 검증
- [ ] 0-1. DB 덤프 (rootbeer + oauth)
- [ ] 0-2. 사용자 export + 사전 매핑 dry-run
- [ ] 0-3. 시크릿 백업
- [ ] 0-4. 사전 공지 (선택)

### Phase 1: oauth-server 통합
- [ ] 1-1. oauth-server seed 등록
- [ ] 1-2. 의존성 정리
- [ ] 1-3. employee_profiles 테이블 신설
- [ ] 1-4. 미들웨어 추가
- [ ] 1-5. 콜백 페이지 + set-cookie/logout/me API
- [ ] 1-6. api-utils 교체 (임시 어댑터 + role/profile upsert)
- [ ] 1-7. Client 컴포넌트 정리
- [ ] 1-8. API `/api/users` admin 변경 (employee_profiles 기준)
- [ ] 1-9. next-auth 제거
- [ ] 1-10. 환경변수 정리
- [ ] 1-11. 로컬 e2e 검증

### Phase 2: DB 스키마 정리 (점검 윈도우 내)
- [ ] 2-0. 점검 모드 진입 (ingress backend 스왑)
- [ ] 2-1. 매핑 데이터 준비
- [ ] 2-2. 매핑 스크립트 작성 + dry-run
- [ ] 2-3. Prisma migration 단계 1 (oauth_user_id 컬럼 추가)
- [ ] 2-4. 매핑 스크립트 실 실행
- [ ] 2-5. Prisma migration 단계 2 (FK 교체, users 테이블 drop)
- [ ] 2-6. 어댑터 코드 제거
- [ ] 2-7. 로컬 검증

### Phase 3: 배포 (점검 윈도우 내, Phase 2 직후 연속)
- [ ] 3-1. 운영 DB 백업 재확인
- [ ] 3-2. 운영 oauth-server seed 반영
- [ ] 3-3. 운영 매핑 사전 재검증
- [ ] 3-4. k8s 매니페스트 / GitHub Actions 갱신
- [ ] 3-5. 컷오버 + 점검 모드 해제 (ingress backend 원복)
- [ ] 3-6. 사후 점검 (D+3, D+7, D+30)

### 진행 로그 (날짜 / 작업자 / 한 줄 요약)
- 2026-05-27: 계획 수립 완료, 작업 미착수

### 차단 사항 / 의문점
- 운영 도메인 확정 필요: `rootbeer-employee-mall.polymorph.co.kr`인지 다른 서브도메인인지 — k8s 매니페스트에서 확인 후 seed 반영
- 운영 사용자 수와 활동 사용자 분포 파악 필요 (Phase 0-2 dry-run에서 확정)

### 사용자에게 받아야 하는 것
- Phase 0 시작 시: rootbeer-employee-mall MySQL 운영 DB 접근 정보, 운영 도메인 확정, 덤프 보관 위치
- Phase 0 종료 후: 매핑 dry-run 결과 표 검토 + 매핑 안 된 사용자에게 사전 oauth 로그인 요청 협조
- Phase 2-4 실행 직전: 매핑 결과 표 재검토 승인
- Phase 3-4 시작 시: polymorph-k8s 리포 push 권한, 운영 도메인/secret 확인
- Phase 3-5 시작 시: 사내 공지 시점/문구 합의, 운영 배포 트리거/시점 합의

# rootbeer-employee-mall → oauth-server 통합 계획서 (Strategy A)

최초 작성: 2026-05-27 (Strategy B — 완전 마이그레이션)
개정: 2026-07-30 (**Strategy A — 링크 컬럼 + opt-in 동의**로 방향 전환. 사용자 결정.)

> 이전 버전(Strategy B: users 테이블 제거 + orders.user_id를 oauth id로 교체 + 점검창 컷오버)은
> git 히스토리에 있고, 본 문서 말미 "부록: Strategy B(완전 정리, 향후)"에 요약으로 남긴다.
> **현재 채택 = Strategy A.**

---

## 🚀 신규 에이전트 시작 안내 (먼저 읽을 것)

rootbeer-employee-mall의 자체 인증(Google 단독 next-auth)을 polymorph oauth-server 통합 인증으로 교체하되,
**기존 회원 테이블/키를 보존**하고 **로그인 시 opt-in 동의로 기존 계정을 연결**하는 단독 실행 계획서다.

### 참고 문서 / 디렉토리
- `apps/oauth-server/CLAUDE.md` — oauth 통합 가이드 (필독)
- `docs/autto-oauth-integration-plan.md` — 직전 유사 사례(단, autto는 Strategy B). 콜백/미들웨어/set-cookie 함정 참고.
- `apps/autto/middleware.ts`, `apps/autto/src/app/auth/callback/`, `apps/autto/src/app/api/auth/` — 통합 reference 구현
- `apps/jibsayo/middleware.ts` — 또 다른 reference
- `packages/shared-auth/` — 인증 라이브러리 (`TokenPayload`: sub/email/name/provider/linkedEmails)

### 진행 원칙
- **각 Phase 종료 시 사용자 확인 후 다음 Phase 진입** (자율 진행 금지)
- **Phase 0 백업 생략 금지**
- **푸시는 사용자 명시 요청 시에만** ([[feedback_push]])
- **argocd 부담 줄이려 영향 단위로 커밋 분할** ([[project_deploy_split_commits]])
- 진행 상황은 하단 "진행 상태 추적"이 SSOT

---

## 개요 & 목표

- 운영 도메인: `rootbeer-employee-mall.polymorph.co.kr` (k8s ingress에서 실제 확인 필요)
- 로컬 포트: 3005 / oauth-server 로컬 3007
- 사용자: 임직원 다수. **승인 워크플로우(pending/user/admin) 보존 필수.**
- 로컬 dev와 prod가 **DB 공유** → 파괴적 스키마 변경 지양(본 전략은 비파괴적이라 문제 없음).

**핵심 원칙 3가지**
1. **인증만 oauth-server에 위임**한다. "임직원몰 이용 승인 여부/역할(pending/user/admin)"은 rootbeer가 계속 소유(로컬 인가).
2. **`users` 테이블과 `orders.user_id`(Int)는 그대로 둔다.** oauth 신원은 `users.oauth_user_id`(nullable 링크 컬럼)로 연결만 한다. → 복합키 파싱/분기 없음, 기존 쿼리 코드 무변경, 비파괴적(점검창 불필요).
3. **기존 회원은 로그인 시 opt-in 동의로 연결**한다. 동의 → 계정 연결(기존 주문/역할 그대로), 거부 → 로그아웃 + 메인.

---

## 왜 Strategy A인가 (결정 근거, 2026-07-30)

| 쟁점 | Strategy A (채택) | Strategy B (이전 계획) |
|---|---|---|
| `orders.user_id` | Int 그대로 (무변경) | Int→String(oauth id) 교체 |
| `users` 테이블 | 유지(=프로필+신원 앵커) | 제거 |
| oauth 신원 저장 | `users.oauth_user_id` 링크 컬럼 | orders FK가 직접 참조 + employee_profiles |
| 스키마 변경 | nullable 컬럼 1개 추가 → **비파괴적** | 파괴적 → **점검창(다운타임) 필요** |
| 비즈니스 쿼리 코드 | **무변경**(user.id 여전히 Int) | 전면 수정(string id) |
| 기존 회원 연결 | 로그인 시 **opt-in 동의**(지연 매칭) | 사전 일괄 매핑 스크립트 |
| 블라스트 반경 | 인증 레이어(api-utils 1파일 + 인증 배선) + useSession 8곳 + 로그인/동의 페이지 | 위 + 전 API/스키마/정산 코드 |
| 최종 정리 | 나중에 B로 진행 가능(여지 남김) | 지금 끝냄 |

**복합키를 안 쓰는 이유**: `orders.user_id`에 `legacy:..|oauth:..` 같은 복합키를 넣으면 모든 조회/쓰기에서
키 파싱 + "복합 유저냐 oauth 유저냐" 분기가 생긴다. 링크 컬럼은 그 이점(양방향 조회·정리 여지)을 그대로
얻으면서 복잡도가 없다.

---

## 데이터 모델 (Strategy A)

비파괴적 — **nullable 컬럼 1개 추가**가 스키마 변경의 전부.

```prisma
model User {                              // 회원 프로필 + 앱 내부 신원 앵커 (유지)
  id           Int      @id @default(autoincrement())   // ← orders.user_id 가 참조. 무변경.
  email        String   @unique                          // 매칭 키
  name         String
  profileImage String?  @map("profile_image")
  googleId     String?  @unique @map("google_id")        // legacy(자체 Google). 유지, 나중 정리.
  oauthUserId  String?  @unique @map("oauth_user_id") @db.VarChar(64)  // ★신규 = JWT sub(oauth User.id, cuid)
  role         UserRole @default(pending)                // 로컬 인가 (승인 워크플로우)
  filterPreset String?  @map("filter_preset") @db.Text
  cautionsAgreedAt DateTime? @map("cautions_agreed_at")   // ★이용 주의사항 필수 동의 시각(감사/강제취소 근거)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  orders       Order[]
  @@map("users")
}

// Order.userId (Int) — 변경 없음. @@unique([roundId, userId]) 유지.
// OrderItem/Purchase/PurchaseItem — Order.id 기반이라 무영향.
```

- `oauth_user_id`가 nullable이라 구/신 코드가 shared DB에서 공존 가능(구 코드는 컬럼 무시).
- 신규 회원도 `users` row로 생성(int PK 자동발급, oauthUserId 세팅, googleId=null) → 신원 체계 단일 유지.

---

## 로그인 / 전환 플로우 (opt-in 동의)

1. 미로그인 진입 → `/login` → oauth-server `/login?clientId=rootbeer-employee-mall&redirectUri=.../auth/callback`
   (autto 패턴: 콜백에서 `#token=` 수신 → `/api/auth/set-cookie` → JWT 쿠키 저장)
2. 서버에서 쿠키의 JWT를 `validateToken`으로 검증 → `{ sub, email, name, linkedEmails }` 획득
3. **프로필 결정 분기** (`/api/auth/me` 또는 api-utils의 세션 해석 지점):
   - **(a) 이미 연결**: `users.oauth_user_id == sub` 인 row 존재 → 정상 진입. role 그대로.
   - **(b) legacy 매칭 (연결 후보)**: `oauth_user_id is null` 인데 `email ∈ {sub email} ∪ linkedEmails` 로
     매칭되는 기존 row 존재 → **마이그레이션 동의 페이지**(`/migrate`)로 유도.
       - 페이지에서 **① 통합회원 전환 안내 + ② 이용 주의사항(아래 전문) + [필수 체크박스]** 노출.
       - 동의(체크 후 진행): `users.oauth_user_id = sub` 세팅(연결) + `cautions_agreed_at = now()`.
         role/주문/filterPreset 전부 그대로 승계 → 진입.
       - 거부/닫기: 쿠키 clear + oauth 로그아웃 + 메인. (아무 것도 저장 안 함)
   - **(c) 매칭 없음 (신규 회원)**: **가입 신청 페이지**(`/apply`)로 유도 → **이용 주의사항 + [필수 체크박스]**.
       - 체크 후 신청: `users` row 생성 `{ email, name, oauthUserId: sub, googleId: null,
         role: email===ADMIN_EMAIL ? 'admin' : 'pending', cautionsAgreedAt: now() }` → "승인 대기" 화면(pending).
4. **주의사항 게이트는 (b)·(c) 공통 필수**. 체크박스 미체크 시 [다음] 비활성 → 진행 불가.
   `cautions_agreed_at`은 감사/강제취소 근거로 저장. (주의사항 개정 시 재동의 정책은 향후 확장)
5. 관리자 승인(pending → user)은 **기존 로컬 워크플로우 그대로** (`/admin/users`, `/api/users`).

**동의 페이지 문구(예)**: "폴리모프 통합회원으로 전환하면 기존 임직원몰 계정({email})과 연결되어 주문·정산
내역이 그대로 유지됩니다. 아래 이용 주의사항을 확인·준수해 주세요." + [필수] 주의사항 확인 체크박스 +
[동의하고 연결] / [지금 안 함(로그아웃)].

### 이용 주의사항 (가입 신청·마이그레이션 동의 시 필수 노출 + 체크박스)

> **⚠️ 미준수 시 강제 취소 처리됩니다.**
>
> **일반 상품**
> - P포인트 사용 가능 (임직원 복지 포인트). **단, 사용 시 문의 바람.**
> - (잔여 포인트 부족 주의 — 포인트는 매년 1월 1일 리셋)
>
> **퍼시픽샵 (재고 상품)**
> - 쿠폰 사용 시 시정에게 문의
> - 사은품 중 유료 멤버십 사용 금지
> - 기본 배송지 선택 해제
> - "써봐야 안다" 구매 금지
> - 뷰티포인트·예치금·기프트카드 사용 금지
>
> **🔴 핵심 (매우 중요)**
> - **당근마켓·중고나라·번개장터 판매 금지** (되팔이 어뷰징 적발이 자주 발생합니다)

체크박스 라벨(예): "위 이용 주의사항을 모두 확인했으며 준수하겠습니다. (미준수 시 주문이 강제 취소될 수 있음에 동의)"

> 주의사항 문구는 운영 정책이라 **하드코딩 대신 `src/lib/cautions.ts` 등 단일 상수/컴포넌트로 관리**해
> (b)/(c) 페이지가 공유하고, 개정 시 한 곳만 수정. (향후 버전 필드로 재동의 트리거 여지)

---

## 인가(승인)·관리자 판정

- `requireAuth()`: 연결/생성된 `users.role !== 'pending'` 검사 (기존과 동일).
- `requireAdmin()`: **`users.role === 'admin'`로 판정**(현재는 email===ADMIN_EMAIL). ADMIN_EMAIL은
  신규 admin 자동 부여(시드)용으로만 상수 유지. → 관리자 화면에서 타 사용자 role 변경 가능.
- 관리자 화면 사용자 목록: `users` 테이블 기준 그대로(변경 최소). 표시 컬럼에 "oauth 연결됨" 여부 추가 권장.

---

## 엣지케이스 / 위험

- **이메일 불일치(카카오 더미 이메일 등)**: 대표 email로 매칭 실패 시 `linkedEmails`(연동된 모든 실제
  email)로 매칭. 그래도 실패 → 관리자 화면에서 **수동 연결**(legacy row ↔ oauth sub) 또는 사용자에게
  "oauth에 기존 이메일 연동 요청" 안내.
- **오연결 위험**: email이 `users.email`(unique)과 verified oauth email로 매칭되므로 사실상 1:1.
  동의 페이지가 사용자 본인 확인 게이트 역할. (자동 연결 금지 — 반드시 동의 경유)
- **중복 sub**: `oauth_user_id` unique → 한 oauth 계정이 두 legacy row에 연결 불가.
- **거부 후 재로그인**: 다시 (b) 분기로 진입 → 언제든 재동의 가능.
- **cron 라우트**(`/api/cron/*`): 세션 무관(cron-auth) → 영향 없음(확인만).

---

## 영향 파일 (Strategy A — 인증 레이어에 국한)

**서버 (핵심은 api-utils 1파일)**
- `src/lib/api-utils.ts` — ★피벗. `getSessionUser()`를 next-auth `getServerSession` → **oauth 쿠키 +
  `validateToken`** 로 교체. 토큰 sub/email/linkedEmails → `users` row 해석(연결/생성). 반환 `user`는
  **여전히 `{ id: number, email, name, role }`** → `requireAuth`/`requireAdmin` 및 모든 호출처 무변경.
- `src/app/api/auth/[...nextauth]/route.ts` — 삭제
- `src/app/api/auth/set-cookie|logout|me/route.ts` — 신설(autto 복제). `me`가 위 (a)/(b)/(c) 분기 판단 소스.
- 그 외 API 라우트(orders/rounds/settlement/users/products/notices/scrape/admin) — **user.id가 Int라 로직 무변경**.
  단 `/api/users`(admin)에 "연결여부" 노출·수동연결 엔드포인트 추가(선택).

**클라이언트**
- `src/lib/auth.ts`, `src/types/next-auth.d.ts` — 삭제
- `src/components/AuthProvider.tsx` — next-auth SessionProvider 제거 → oauth 세션 컨텍스트(`/api/auth/me` fetch) 로 대체
- `useSession` 8곳 정리: `app/page.tsx`, `products/[id]/page.tsx`, `admin/layout.tsx`, `my-orders/page.tsx`,
  `notices/page.tsx`, `notices/[id]/page.tsx`, `cart/page.tsx`, `components/TopBar.tsx`
- `src/app/login/page.tsx` — `signIn('google')` → oauth-server 리다이렉트
- `src/app/migrate/page.tsx` — ★신설(마이그레이션 동의 + 주의사항 체크 게이트)
- `src/app/apply/page.tsx` — ★신설(신규 가입 신청 + 주의사항 체크 게이트) → pending 생성
- `src/lib/cautions.ts` — ★신설(이용 주의사항 문구 단일 상수/컴포넌트, migrate·apply 공유)
- `src/middleware.ts` — 신설(autto 복제, CLIENT_ID='rootbeer-employee-mall', `/api`·`/auth/callback` matcher 제외)

**설정**
- `package.json`: `@package/shared-auth` 추가, `next-auth` 제거
- env: `NEXT_PUBLIC_OAUTH_SERVER_URL`, `OAUTH_JWT_SECRET` 추가 / `NEXTAUTH_*`, `GOOGLE_CLIENT_*` 제거 (ADMIN_EMAIL 상수 유지)
- `apps/oauth-server/prisma/seed.ts`: `rootbeer-employee-mall` ClientApp 등록(redirectUri 로컬+운영)

---

## 실행 계획 (Phase)

### Phase 0: 백업 (가벼움, 생략 금지)
- [ ] rootbeer DB 덤프(`mysqldump --single-transaction`) → `.backups/rootbeer-mall-oauth-migration/`
- [ ] 시크릿 백업(`.env.local`, k8s secret). GOOGLE_CLIENT_*는 rootbeer에서 제거 예정이나 보관.
- ※ Strategy A는 비파괴적이라 사전 일괄 매핑 스크립트/dry-run 불필요(지연 매칭). 덤프는 롤백 안전장치.

### Phase 1: oauth 통합 + 링크 컬럼 + 동의 페이지 (로컬)
- [ ] 1-1. oauth-server seed에 ClientApp 등록 + 로컬 seed
- [ ] 1-2. deps: shared-auth 추가 / next-auth는 1-말미 제거, `pnpm install`
- [ ] 1-3. Prisma: `users.oauth_user_id`(nullable unique) + `users.cautions_agreed_at`(nullable) 컬럼 추가
        → `db:migrate --name add_user_oauth_id_and_cautions`
- [ ] 1-4. middleware.ts (autto 복제)
- [ ] 1-5. auth/callback 페이지 + set-cookie/logout/me API
- [ ] 1-6. **api-utils 피벗**: getSessionUser를 oauth 토큰 기반으로. sub→users(oauthUserId) 조회,
        없으면 (b)/(c) 판단. requireAuth/requireAdmin 유지(role 기준). 반환 user.id=Int 유지.
- [ ] 1-7. 주의사항 게이트: `src/lib/cautions.ts`(문구 상수) + `/migrate`(연결 동의)·`/apply`(신규 신청)
        페이지 — 둘 다 주의사항 노출 + [필수 체크박스](미체크 시 진행 불가). 연결/신청 API에서
        `cautions_agreed_at=now()` 세팅. `/migrate` 거부 → logout.
- [ ] 1-8. 클라 정리: AuthProvider(oauth me 기반)·useSession 8곳·login 리다이렉트·TopBar
- [ ] 1-9. next-auth 제거(파일/의존성/잔재 import)
- [ ] 1-10. env 정리
- [ ] 1-11. 로컬 e2e:
  - oauth(3007)+rootbeer(3005) 동시 → silent SSO
  - 본인(majac6@gmail) 로그인 → (b) legacy 매칭 → `/migrate` 주의사항 노출 → **체크 전 [다음] 비활성**
    확인 → 체크 후 동의 → 연결 + `cautions_agreed_at` 기록 → **기존 주문 그대로** + admin 자동
  - 미연결 상태에서 거부 → 로그아웃+메인
  - 신규 계정 → (c) `/apply` 주의사항 체크 → 신청 → pending → 승인 대기 화면 → admin이 user 승인 → 재로그인 정상
  - 격리: 다른 사용자 로그인 시 본인 주문만
  - cron 라우트 무영향

### Phase 2: 배포 (비파괴적 — 점검창 불필요)
- [ ] 2-1. 운영 oauth-server seed 반영(ClientApp)
- [ ] 2-2. `users.oauth_user_id` 컬럼 운영 DB에 `prisma migrate deploy`(사람이 직접). nullable이라 구 이미지 정상 동작.
- [ ] 2-3. k8s secret/워크플로우 env 갱신(OAUTH_*, GOOGLE_* 제거)
- [ ] 2-4. 신규 이미지 빌드·배포(분할 커밋·푸시). 배포 순간부터 로그인만 oauth로 전환(데이터는 비파괴).
- [ ] 2-5. 사내 공지: "로그인 방식이 폴리모프 통합계정으로 바뀝니다. 첫 로그인 시 기존 계정 연결 동의가 뜹니다."
        (다운타임 없음 — 점검창 불필요)
- [ ] 2-6. 본인 계정 컷오버 검증(연결·주문·정산) → 임직원에게 정상화 안내
- [ ] 2-7. 미매칭 사용자 지원: 로그인 안 되거나 주문 안 보이면 관리자 수동 연결

### Phase 3 (향후·선택): 완전 정리 = Strategy B
전원이 oauth로 연결된 것을 확인한 뒤, 원할 때 별도 작업으로:
- googleId/자체 Google OAuth 클라이언트(Google Cloud Console) 정리
- (원하면) users 제거·orders.user_id를 oauth id로 단일화 + employee_profiles 분리 → 아래 부록 참조
- 지금은 **여지만 남긴다**(정리는 나중).

---

## 부록: Strategy B (완전 정리, 향후 선택지) — 2026-05-27 원안 요약

users 테이블 제거 + `orders.user_id` Int→String(oauth User.id) + `employee_profiles`(oauthUserId PK)로
role/filterPreset 이관. shared DB라 점검창(maintenance-svc ingress 스왑) 필요, 사전 일괄 매핑 스크립트
(email→linkedEmails, dry-run 우선), 확장(신규 컬럼 채움→검증→구 컬럼 drop) 순서. 상세 단계는 git 히스토리의
본 문서 2026-05-27 버전 참조. **Strategy A로 먼저 전환한 뒤, 필요 시에만 진행.**

---

## 진행 상태 추적 (SSOT)

### 현재 단계
**계획 개정 완료(Strategy A 확정, 2026-07-30). 작업 미착수.**

### 결정 (2026-07-30, 사용자 승인)
- 신원/데이터 모델: **A(링크 컬럼)** — users 유지 + oauth_user_id, orders.user_id 무변경
- 기존 회원 연결: **opt-in 동의**(로그인 시 지연 매칭 + 동의 페이지)
- 인가: 로컬 유지(pending/user/admin), admin 판정 role 기반
- 완전 정리(B)는 향후 선택지로 연기

### 체크리스트
- [ ] Phase 0: 백업
- [ ] Phase 1: oauth 통합 + 링크 컬럼 + 동의 페이지 (로컬 e2e)
- [ ] Phase 2: 배포(비파괴)
- [ ] Phase 3(선택): 완전 정리(B)

### 진행 로그
- 2026-05-27: Strategy B 계획 수립
- 2026-07-30: Strategy A로 개정(링크 컬럼 + opt-in 동의). 사용자 결정.

### 사용자에게 받아야 하는 것
- Phase 0: rootbeer 운영 DB 접근/덤프 위치, 운영 도메인 확정
- Phase 2: oauth ClientApp redirectUri(운영), k8s push 권한, 사내 공지 시점, 배포 트리거
- 미매칭 사용자 발생 시: 관리자 수동 연결 정책 확인

### 관련 메모리
- [[project_rootbeer_mall_oauth_migration]] [[project_autto_oauth_migration]] [[reference_destructive_migration_ordering]] [[feedback_push]] [[project_deploy_split_commits]]

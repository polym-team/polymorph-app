# rootbeer-employee-mall 입금 자동 정산 계획서

작성일: 2026-07-21

---

## 🚀 신규 에이전트 시작 안내 (먼저 읽을 것)

사내 공동구매 몰(`apps/rootbeer-employee-mall`)의 **계좌 입금 확인 → 주문 정산완료** 를 자동화한다. 이전 대화 컨텍스트 없이도 이 파일만으로 이어받을 수 있다.

### 핵심 설계 원칙: 3-피스 디커플링

```
① [별도 repo] 안드로이드 브릿지            ② [별도 앱] tallo (입금 원장)
   은행 입금 SMS/푸시 수신 → 파싱             POST /api/deposits  (브릿지→원장, Bearer)
        └────────────────────────────────▶   입금내역 원본 저장 + 조회 API 제공
                                              GET  /api/deposits?from&to (소비자→원장, Bearer)
                                                        ▲  pull
                                                        │
                                      ③ [apps/rootbeer-employee-mall]
                                         CronJob(주기) → 원장에서 입금내역 당겨옴
                                         → 이름+금액으로 현재 주문과 대조(매칭 엔진)
                                         → 주문 settled, 근거 입금 id를 Order에 기록
                                         → 라운드 전건 정산 시 round settled + 슬랙
                                         (애매/미매칭은 관리자 확인 큐)
```

**왜 이렇게 나누나 (디커플링 근거):**
- **입금 원장(②)** 은 은행 데이터의 단일 소유자. 브릿지가 어떻게 캡처하든(안드로이드 SMS/알림, 훗날 PayAction 웹훅) 원장 뒤는 안 바뀐다. mall 외 다른 앱도 이 원장을 소비 가능(범용).
- **mall(③)** 은 은행 PII를 저장하지 않는다. 원장에서 **당겨와 대조**하고, 주문에는 **근거 입금의 고유 id만 참조**로 남긴다.
- 셋의 경계는 **HTTP뿐**: 브릿지→원장(`POST`), mall→원장(`GET`). 어느 쪽 구현이 바뀌어도 계약만 지키면 나머지는 무영향.

### 컴포넌트별 저장소/위치
- **① 안드로이드 브릿지** — **별도 git 저장소**(예: `deposit-bridge`). Kotlin/Gradle(또는 RN). iOS는 앱의 SMS 접근 불가라 **안드로이드 전용**. 캡처: `NotificationListenerService`(은행앱 푸시, RTPay 방식) 또는 SMS `BroadcastReceiver`. → **③,②가 확정된 뒤 착수.**
- **② tallo** — **polymorph-app 모노레포의 신규 앱**(`apps/tallo`) 권장. Next.js API 라우트만 있는 얇은 서비스. 자체 DB. (모노레포 = 공통 패키지·k8s 배포 플로우 재사용. "별도 repo로 뺄지"는 Phase 0 확인 항목)
- **③ mall 변경** — `apps/rootbeer-employee-mall` 내부. 크론은 `polymorph-k8s/manifests/rootbeer-employee-mall/`.

### 참고 파일
- `apps/rootbeer-employee-mall/src/app/api/rounds/[id]/settlement/route.ts` — **정산 금액 계산 로직(매칭 키의 출처)**
- `apps/rootbeer-employee-mall/src/app/api/rounds/[id]/route.ts` — 라운드 상태 전이(PATCH) + 슬랙 알림(`notifyRoundSettled`)
- `apps/rootbeer-employee-mall/prisma/schema.prisma` — MySQL. `Order @@unique([roundId, userId])`
- `apps/rootbeer-employee-mall/src/lib/api-utils.ts` — 세션 인증 헬퍼
- 신규 앱 참고: `apps/maintenance`(얇은 앱 구조), `apps/oauth-server/CLAUDE.md`(필요 시 인증)

### 진행 원칙
- **각 Phase 종료 시 사용자 확인 후 진입** (자율 진행 금지)
- **푸시는 사용자 명시 요청 시에만**, 커밋은 영향 단위로 분리
- 진행 상태는 하단 "진행 상태 추적"에 기록

---

## 도메인 배경 (As-Is)

- 공동구매는 **라운드(OrderRound)** 단위: `open → closed → ordered → settled`. 사용자는 라운드당 1주문(`@@unique`).
- **한 사용자가 입금해야 할 금액** = `items_total + shipping_share`
  - `items_total` = 활성 아이템 `Σ(priceAtOrder × quantity)`
  - `shipping_share` = 참여한 각 `Purchase`의 `ceil(shippingFee / 참여자수)` 합
  - 이미 `GET /rounds/[id]/settlement`에 구현됨 → **공용 함수로 추출해 매칭 엔진과 공유**.
- **현재 정산(수동)**: admin이 입금을 눈으로 확인 → `PATCH /rounds/[id] {status:'settled'}` → `OrderRound.status`만 변경 + 슬랙. **개별 `Order.status`는 미사용** → 자동화하며 주문별 정산 개념을 살린다.
- **입금 식별 정보**: 각 계정에 **이메일(신원) + 이름**이 있음. 실제 입금자 대부분 **본인 이름 + 금액**으로 입금 → **이름+금액 매칭이 현실적**(주문번호 안내 방식 불필요).

## 매칭 전략 — ✅ **A. 이름 + 금액** (2026-07-21 확정)

- `기대금액 == 입금액` 후보 주문 중 **입금자명 == User.name** 으로 확정. UX 무변경(사용자에게 별도 코드·금액 안내 안 함).
- **자동은 안전한 것만**: 단일 후보 + 이름 일치일 때만 자동 정산. 동명이인·동일금액 충돌, 대리송금(입금자명≠본인)은 **관리자 확인 큐**로.
- 금액 유니크화(전략 B)는 채택 안 함. 훗날 충돌 잦으면 승격 검토.

---

## ② Tallo (입금 원장 서비스) 설계

> **Tallo** = 입금 대조·확인 API 서비스. 앱 위치 `apps/tallo`(모노레포 신규 앱, 자체 DB), 서브도메인 `tallo.polymorph.co.kr`. 훗날 단독 상품화 여지를 고려한 브랜드명. 역할은 둘뿐: **입금 적재**(브릿지 수신) + **입금 조회**(소비자 제공). 매칭·정산은 전혀 모른다(dumb ledger).

### 데이터 (원장 자체 DB)
> **DB 스택**: 클러스터 DB(cloudnative-pg) 미사용. **같은 네트워크의 NAS에서 운영 중인 MySQL** 서버에 Tallo **전용 데이터베이스**를 새로 만들어 사용(mall과 같은 서버여도 database는 분리 → 도메인 격리). Prisma `provider = "mysql"`, `DATABASE_URL`은 NAS MySQL을 가리키며 k8s Secret으로 주입. (mall도 동일 NAS MySQL 사용 패턴)

```prisma
model Deposit {
  id          Int      @id @default(autoincrement())
  externalId  String   @unique @map("external_id") // 멱등 키(브릿지 생성: 원문 해시 등)
  bankAccount String?  @map("bank_account")         // 수취 계좌(우리 계좌)
  payerName   String   @map("payer_name")           // 입금자명(원문)
  amount      Int                                    // 입금액(원)
  balance     Int?                                   // 잔액(파싱되면)
  txAt        DateTime @map("tx_at")                 // 은행 거래 시각(문자에서 파싱)
  rawText     String   @map("raw_text") @db.Text     // 원문(감사용)
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([txAt])
  @@map("deposits")
}
```
> 원장에는 매칭 상태(matched/ignored 등)를 두지 않는다 — 소비 상태는 **소비자(mall)가 소유**(디커플링). 소비자가 여러 개로 늘면 그때 claim 시맨틱 도입 검토.

### API
- **`POST /api/deposits`** (브릿지 인그레스)
  - 인증: `Authorization: Bearer <TALLO_INGEST_TOKEN>`
  - 본문:
    ```jsonc
    {
      "externalId": "sms-2026-07-21T18:18:05-1268-1", // 멱등키(필수)
      "bankAccount": "1002...1268",                    // 선택
      "payerName": "홍길동",                            // 필수
      "amount": 32000,                                  // 필수(원, 정수)
      "balance": 1532000,                               // 선택
      "txAt": "2026-07-21T18:18:05+09:00",             // 필수(ISO8601)
      "rawText": "[Web발신] 우리 07/21 18:18 ..."       // 필수
    }
    ```
  - `externalId` upsert(중복 무시). 출금 문자는 브릿지가 걸러 **입금만** 전송.
  - 응답 `{ "created": true|false, "id": 123 }`
- **`GET /api/deposits?from=<ISO>&to=<ISO>`** (소비자 조회)
  - 인증: `Authorization: Bearer <TALLO_READ_TOKEN>` (인그레스 토큰과 분리)
  - 기간 내 입금 목록 반환(`id, externalId, payerName, amount, txAt`). 페이지네이션(커서/limit).
  - mall은 이 `externalId`(또는 `id`)를 근거 id로 사용.

---

## ②-bis Tallo 온보딩 / 계좌 관리 (2026-07-23, 등록 단위=계좌)

> **모델 — 분산형**: 각 사용자가 **자기 폰에 브릿지 앱을 직접 설치**해 자기 은행 문자를 받는다. 우리는 **앱 + Tallo 웹 플랫폼만 제공**(중앙 SMS/회선 인프라 없음).
>
> **등록 단위 = "계좌"** (기기 아님). 한 폰이 여러 계좌의 우리은행 SMS를 받을 수 있으므로, 등록할 것은 **계좌번호**다. SMS의 **마스킹 계좌**(예: `*981268`)를 **등록된 계좌번호 뒷자리와 매칭**해 ① **감시 대상 계좌만 필터**(폰에 오는 개인·무관 계좌 입금 배제) ② **어느 계좌 입금인지 귀속**(Phase 3).
>
> **⚠️ OTP/등록세션/기기(Device) 개념 제거됨(2026-07-23).** 분산 모델에선 사용자가 자기 은행 입금알림을 스스로 신청하고 OTP도 자기 폰에서 직접 처리 → 우리가 OTP 캡처·릴레이·orchestrate할 이유 없음(옛 중앙번호 모델 잔재). `RegistrationSession`·`/api/registrations/*`·웹 마법사·번호잠금·파서 `otp`·`Device` 전부 삭제.

### 두 개의 인증 평면
- **사용자 평면(웹+앱 로그인)**: **oauth-server(폴리모프 SSO)**. Tallo 웹·RN 앱 모두 SSO, JWT 검증 `packages/shared-auth`. (Tallo에 oauth 통합 완료.)
- **데이터 평면(입금 적재/조회)**: scope 토큰(ingest/read) — 기존. ※ 브릿지의 실제 전송 인증 방식(SSO JWT vs 토큰)은 **Phase 3에서 확정**.

### 역할 분담
- **웹(Tallo 서비스 페이지)**: 계좌 **추가(은행+계좌번호+라벨)/수정/삭제** + 상태 표시. 계좌 CRUD는 웹에서만.
- **앱(RN)**: SSO 로그인 + **계좌 조회 전용** + SMS 캡처·전달. 등록/관리 불가(웹으로 안내).

### 데이터 모델
```prisma
model Account {
  id                      Int       @id @default(autoincrement())
  userId                  String    @map("user_id")   // oauth User.id (소유자)
  bank                    String    @default("woori")
  accountNumber           String    @map("account_number")  // 전체 저장(예: 1002-854-981268)
  label                   String?
  // 은행 입금알림 등록 "확인" — 수동 토글 아님. 앱이 이 계좌의 첫 은행 SMS를 전달하면 자동 세팅(Phase 3).
  notificationConfirmedAt DateTime? @map("notification_confirmed_at") // null = 아직 문자 유입 없음
  createdAt               DateTime  @default(now()) @map("created_at")
  @@index([userId])
  @@map("accounts")
}
```

### 흐름
1. **웹에서 계좌 등록**: 사용자 SSO 로그인 → 계좌 추가(은행 + **계좌번호 전체** + 라벨).
2. **은행 입금알림 신청**: 사용자가 그 계좌로 은행 입금알림을 **직접 신청**(우리 개입/OTP 없음).
3. **파싱·필터·자동확인(Phase 3)**: 앱이 받은 우리은행 SMS 중, **마스킹 계좌가 등록 계좌 뒷자리와 매칭되는 입출금만** 파싱·전달. Tallo는 매칭된 계좌의 `notificationConfirmedAt`을 자동으로 찍는다 → 상태 "확인됨"(실 데이터 흐름 = 등록 성공 증거).

### 매칭 규칙(Phase 3)
- 우리은행 입금 SMS의 계좌는 마스킹 노출(예: `*981268` = 끝 6자리). 등록 `accountNumber`에서 숫자만 추출한 뒤 **노출 자리수만큼 뒷자리 비교**. 은행마다 마스킹 자리수 다를 수 있어 노출분 기준 비교.

### API
- **사용자 평면(SSO 보호)**: `GET/POST /api/accounts`(목록/추가), `PATCH/DELETE /api/accounts/:id`(수정/삭제), `GET /api/me`.
- **데이터 평면(기존)**: `/api/deposits`, `/api/tokens`.

### 멀티테넌트
- Account가 oauth userId 귀속 → 멀티테넌트 기반. 외부 개방 시 `deposits`에 account/user 귀속 컬럼 추가(지금은 미룸).

## ③ mall 변경 설계

### 스키마 (`prisma/schema.prisma`, MySQL)
```prisma
model Order {
  // ...기존 필드...
  matchedDepositId String?  @map("matched_deposit_id") // 근거 입금의 원장 고유 id(externalId)
  settledAt        DateTime? @map("settled_at")
  matchedBy        String?  @map("matched_by")          // 'auto' | admin email
  // status(OrderStatus): 매칭 시 settled로 전환

  @@index([matchedDepositId])
}
```
- **mall은 입금 원본을 저장하지 않는다.** 주문에 **원장 입금 id 참조**만 남긴다(근거/감사).
- `matchedDepositId`는 "이미 소비된 입금" 판정에도 쓰인다(같은 입금 id가 두 주문에 붙지 않게).
- 관리자가 "정산 무관"으로 넘긴 입금 id를 담을 소규모 `DismissedDeposit(externalId @unique)` 테이블(값은 id뿐, PII 없음) — 관리자 큐의 ignore 상태 보존용. (Phase 4에서 필요 여부 확정)

### 매칭·정산 엔진 (`src/lib/settlement.ts` 신설)
1. **공용 함수 추출**: `computeRoundSettlement(roundId)` → 주문별 `{ orderId, userId, userName, expected }`. 정산조회 API와 공유.
2. **`reconcile()`** (크론이 호출):
   - 원장 `GET /api/deposits` 로 **롤링 윈도우**(예: 가장 오래된 미정산 `ordered` 라운드 생성일 이후) 입금 pull.
   - 소비 제외: `Order.matchedDepositId`에 이미 있는 id + `DismissedDeposit`에 있는 id 제거.
   - 후보 주문 = `round.status='ordered'` && `order.status!='settled'`.
   - 각 미소비 입금에 대해:
     - `expected == deposit.amount` 후보 추림.
     - **정확히 1건 + `normalize(payerName)==User.name`** → 자동 정산:
       `order.status='settled'`, `order.settledAt=now`, `order.matchedDepositId=deposit.externalId`, `matchedBy='auto'` (단일 트랜잭션).
     - 그 외(0건 / 다중 / 이름 불일치) → 건드리지 않음(관리자 큐 대상).
   - 영향받은 라운드마다 **`maybeSettleRound`**: 전 주문 `settled`면 `OrderRound.status='settled'` + 기존 `notifyRoundSettled`.
   - `normalize` = 공백제거·trim(은행별 접미사 규칙은 추후 보강).
3. **롤백**: admin이 매칭 해제 → `order.status` 복구, `settledAt=null`, `matchedDepositId=null`. 라운드가 `settled`였으면 `ordered`로.

### 인증
- 크론이 호출하는 `POST /api/settlement/reconcile` 는 세션이 없으므로 전용 토큰(`requireReconcileToken`).
- mall→원장 호출용 `TALLO_READ_TOKEN`은 mall 환경변수(k8s Secret).

### 관리자 확인 큐 (`/(admin)/deposits`, admin 전용)
- **조회 시점에 원장에서 pull** → 소비/무시 id를 뺀 나머지 = 미처리 입금. mall은 입금을 저장 안 하므로 큐는 항상 원장 기준으로 계산.
- 각 미처리 입금에 **후보 주문 추천**(금액 일치/이름 유사) → 클릭으로 수동 연결(→정산) / "정산 무관"으로 `DismissedDeposit` 등록.
- 라운드별 정산 진행률(`정산 n/m`) 표시. 상태 라벨은 `src/lib/status.ts` 컨벤션 준수.

---

## 인증·토큰 정책 — ✅ **토큰 발급 API 방식** (2026-07-22 확정, 전진 배치)

> 당초 "정적 토큰 수기 등록(지금) → 키 발급 기능(향후)"에서, **키 발급을 Phase 1로 앞당김**. Tallo가 토큰을 DB에 저장·발급·검증하는 주체가 된다. (사용자 결정)

- **발급**: Tallo에 **토큰 발급 API**를 둔다. 관리자 인증 하에 `scope`(`ingest` | `read`)를 지정해 토큰을 생성 → 불투명 랜덤 문자열(예: 32바이트 base64url) 반환. 원문은 발급 시 1회만 노출, DB에는 **해시로 저장**.
  - 토큰 테이블(Tallo DB): `ApiToken { id, name, scope, tokenHash @unique, lastUsedAt?, revokedAt?, createdAt }`.
  - 검증: 요청 `Authorization: Bearer <token>` → 해시 비교(상수-시간). `revokedAt` 있으면 거부. 스코프로 엔드포인트 권한 분리(`ingest`=`POST /api/deposits`, `read`=`GET /api/deposits`).
  - 회전/폐기: 발급 API로 새 토큰 발급 후 소비자 교체, 구 토큰 `revoke`. Secret 수기 편집 불필요(mall/브릿지 env에 값만 주입).
- 소비 주체별 토큰: 브릿지=`ingest` 토큰, mall=`read` 토큰. mall→mall 크론(`RECONCILE_TOKEN`)은 Tallo와 무관하므로 **mall 쪽 정적 Secret 유지**(별도 이슈).
- 부트스트랩: 최초 관리자 인증/시드 토큰 발급 방식은 Phase 1 착수 시 확정(env 시드 or oauth-server 연동).
- **향후 확장**: 외부 고객 개방 시 이 발급 API에 고객별 키·스코프·사용량·UI를 얹어 확장.

## 크론 (polymorph-k8s)
- `polymorph-k8s/manifests/rootbeer-employee-mall/` 에 CronJob → `POST /api/settlement/reconcile`(`RECONCILE_TOKEN`) 주기 호출. 기본 **주 1회(일요일 오전)**, 필요 시 상향.
- 원장은 별도 앱이므로 `polymorph-k8s/manifests/tallo/` 에 배포 매니페스트 + Secret(`TALLO_INGEST_TOKEN`, `TALLO_READ_TOKEN`, `DATABASE_URL`) 신규 작성. mall Secret에는 `RECONCILE_TOKEN`, `TALLO_READ_TOKEN` 추가.

---

## 위험 및 대응
| 위험 | 대응 |
|---|---|
| 개인 계좌의 **정산 무관 입금**(급여·개인이체)이 오정산 | 기대금액 **정확 일치 + 이름 일치**에만 자동 반응. 나머지는 방치 → 큐 |
| **동일 금액 충돌** | 이름으로 좁힘, 그래도 애매하면 큐. 잦으면 전략 B 승격 검토 |
| **입금자명 ≠ 본인**(대리송금) | 자동 실패 → 큐에서 관리자 수동 연결. 전략 A의 감수 지점 |
| **중복 문자** | 원장 `externalId @unique` 멱등 |
| **입금 id 이중 소비** | mall `matchedDepositId` 유니크 체크(한 입금 = 한 주문) |
| **부분/초과 입금** | 정확 일치 아님 → 자동 안 됨 → 큐 |
| 브릿지 다운·문자 누락 | 원장은 받는 대로 적재, mall은 롤링 윈도우로 재-pull → 지연 도착도 다음 크론에 매칭 |
| 은행 포맷 변경 | 파싱은 **브릿지 책임**. 원장/mall은 구조화 payload만 신뢰 |
| 토큰 유출 | 인그레스/조회 토큰 분리·회전. 각 엔드포인트 권한 최소화(원장 쓰기 vs 읽기) |
| 개인 금융정보 보관 | **원장에만** 존재(mall은 id만). 원장 `rawText` 보관기간/마스킹 정책 Phase 검토 |

---

## 진행 순서 (2026-07-22 재조정)

> **원칙: 실제 데이터 흐름이 end-to-end로 검증되기 전엔 mall을 건드리지 않는다.** mall 스키마/매칭(Phase 2·3·4)은 **최후로 미룬다**.
>
> 1. **Tallo 서버 완성 + 프로덕션 배포 확인** ← 지금 여기
> 2. **RN 브릿지 앱**(별도 repo `tallo-react-native`): 우리은행 SMS 중 **등록 계좌와 매칭되는 입출금만** 파싱 → `POST /api/deposits` 적재 + 첫 유입 시 계좌 자동확인. 온보딩은 **웹에서 계좌 등록 + 사용자가 은행 입금알림 직접 신청**뿐(OTP 없음 — ②-bis 참조). 계획서 = 그 repo의 `PLAN.md`. (안드로이드 전용)
> 3. **사이클 검증**: 실제 문자 → 브릿지 파싱 → tallo 적재 → `GET /api/deposits` 조회까지 한 바퀴 도는 것을 실데이터로 확인.
> 4. **그 다음에야** mall 작업(Phase 2 스키마 → Phase 3 매칭 엔진 → Phase 4 큐 → Phase 5 크론).

## Phase별 체크리스트
- [x] **Phase 0 — 결정 완료**: 매칭 전략 **A(이름+금액)**. 원장 = 모노레포 신규 앱 **`apps/tallo`**(서비스명 **Tallo**). DB = **NAS MySQL**의 Tallo 전용 database(클러스터 DB 미사용, Prisma `mysql`). 인증 = **k8s Secret 정적 토큰**(내부 생성, 추후 외부 확장 시 키 발급 기능으로 승격).
- [x] **Phase 1 — tallo 앱**: **완료 + 프로덕션 배포·검증 완료(2026-07-22)**. `https://tallo.polymorph.co.kr` LIVE. 세부:
  - [x] `apps/tallo` 스캐폴딩(package.json/next.config/tsconfig/.eslintrc/Dockerfile, 포트 3010, 루트 `pnpm tallo`)
  - [x] `Deposit`+`ApiToken` Prisma 스키마 + NAS MariaDB(`tallo` DB)에 baseline 마이그레이션(`prisma/migrations/0_init`) 적용
  - [x] 토큰 발급 API `POST/GET /api/tokens`, `DELETE /api/tokens/[id]` — 관리자 부트스트랩(`TALLO_ADMIN_TOKEN`), 원문 1회 노출·SHA-256 해시 저장, scope=ingest/read
  - [x] `POST /api/deposits`(scope=ingest, externalId 멱등 upsert) + `GET /api/deposits?from&to&cursor&limit`(scope=read, 커서 페이지네이션) + `GET /api/health`
  - [x] 로컬 E2E 스모크 + **프로덕션 E2E 스모크**(cluster→NAS DB 쓰기/읽기, 인증 401/403, 멱등, revoke) 전건 통과. 테스트 데이터 정리(DB 비어있음).
  - [x] **배포 매니페스트** `polymorph-k8s/manifests/tallo/`(deployment+health probe/service/ingress/secret) + `apps/tallo/application.yaml` (argocd sync 확인)
  - [x] **CI** `.github/workflows/tallo-deploy-polymorph-k8s-prd.yaml` (ghcr.io, 성공)
  - [ ] **운영 토큰 발급은 소비자 착수 시**: 브릿지(RN) 착수 시 ingest 토큰 1개, mall 착수 시 read 토큰 1개. 프로덕션 `TALLO_ADMIN_TOKEN`은 `polymorph-k8s/manifests/tallo/secret.yaml`에 있음.

> **다음 = 진행 순서 2번(RN 브릿지 앱, 별도 repo).** tallo `POST /api/deposits` 계약 고정됨 → 브릿지 착수 가능. mall(Phase 2~5)은 사이클 검증 후 최후.
- [ ] **Phase 2 — mall 스키마**: `Order`에 `matchedDepositId/settledAt/matchedBy` (+필요시 `DismissedDeposit`) 추가 + 마이그레이션.
- [ ] **Phase 3 — mall 매칭 엔진**: `computeRoundSettlement` 추출, 원장 pull 클라이언트, `reconcile()`/`maybeSettleRound`/롤백, `POST /api/settlement/reconcile`(토큰). 단위 테스트(0/1/다중 후보, 이름 불일치, 초과입금, 이중소비, 지연도착).
- [ ] **Phase 4 — 관리자 큐**: `/(admin)/deposits`(원장 pull 기반) + 수동 연결/해제/무시.
- [ ] **Phase 5 — 크론**: `polymorph-k8s`에 mall CronJob + Secret. 원장 배포 확인.
- [ ] **① 브릿지(별도 repo)**: Phase 1의 `POST /api/deposits` 계약이 고정되면 착수.

---

## 진행 상태 추적
- 2026-07-21: 계획서 최초 작성.
- 2026-07-21: 매칭 전략 A(이름+금액) 확정.
- 2026-07-21: **아키텍처를 3-피스 디커플링으로 개정** — 입금 원장을 별도 앱으로 분리, mall은 크론으로 pull+매칭하고 `Order.matchedDepositId`에 근거 입금 id만 기록.
- 2026-07-21: 입금 원장 = **모노레포 신규 앱 `apps/tallo`**(서비스명 **Tallo**, 서브도메인 `tallo.polymorph.co.kr`)로 확정.
- 2026-07-22: Phase 0 잔여 결정 완료 — DB는 **NAS MySQL**의 Tallo 전용 database(클러스터 DB 미사용).
- 2026-07-22: **인증 정책 개정** — 정적 토큰 수기 등록 대신 **Tallo 토큰 발급 API**(scope=ingest/read, 해시 저장·검증)로 전진 배치. Phase 1 범위에 `ApiToken` 스키마 + 발급/검증 포함.
- 2026-07-22: **Phase 1 착수 blocker** = 사용자가 **NAS MySQL 접속 정보(DATABASE_URL, Tallo 전용 DB/계정)** 를 생성해 전달하는 단계. 정보 수령 즉시 `apps/tallo` 스캐폴딩 시작.
- 2026-07-22: **MySQL 정보 수령**(user=tallo/db=tallo, host는 jibsayo와 동일 `majac.iptime.org:13306`, MariaDB 10.5.26). 접속·권한(ALL ON tallo.*) 검증 완료.
- 2026-07-22: **Phase 1 앱 코드 완료**. `apps/tallo` 스캐폴딩 + Prisma(Deposit/ApiToken) + baseline 마이그레이션 실DB 적용 + 토큰 발급/데이터 API 구현 + E2E 스모크 전건 통과.
- 2026-07-22: **진행 순서 재조정** — mall(Phase 2~5)을 최후로 미룸. tallo 배포 → RN 브릿지 → 실데이터 사이클 검증 후에야 mall 착수.
- 2026-07-22: **브릿지 앱 계획 수립**(별도 repo `tallo-react-native/PLAN.md`) + **Tallo 온보딩(②-bis) 추가**. 인증번호=은행 발송·앱 캡처(게이트웨이 불필요), 등록 상호배제=번호 단위. 파싱 로직은 실 SMS 샘플(입금/출금/OTP) 확보 후 확정.
- 2026-07-23: **등록 단위 Device→Account 전환 + 재배포**. 사용자 통찰: 등록 단위는 기기가 아니라 **계좌**(한 폰이 N개 계좌 SMS 수신). SMS 마스킹 계좌(`*981268`)를 등록 계좌번호(`1002-854-981268`) 뒷자리와 매칭해 감시대상 필터+귀속. Device 모델/라우트/웹 제거→Account(bank+accountNumber 전체저장+label+notificationConfirmedAt), `/api/accounts` CRUD, 웹 `/accounts`, 앱 계좌 조회. 마이그레이션 3_accounts(devices DROP+accounts CREATE) 실DB 적용. tsc/build 통과, 커밋·push, CI 성공(argocd 롤아웃 대기).
- 2026-07-23: **온보딩 대폭 단순화 + 재배포**. 실기기(삼성, eSIM) 테스트 중 사용자 피드백으로 방향 정정 — 분산 모델에선 OTP 캡처/등록세션이 불필요(옛 중앙번호 모델의 잔재). **제거**: `RegistrationSession`·`/api/registrations/*`·웹 등록마법사·번호잠금·파서 otp. **교체**: Device.ingestTokenId→notificationConfirmedAt(앱이 첫 은행SMS 전달 시 Tallo가 자동 세팅, Phase 3). 웹=기기 add(수동번호)/edit/delete, 앱=조회 전용. eSIM에서 번호 자동조회 실패→수동 메인. 마이그레이션 2_simplify_onboarding 실DB 적용, tsc/build/E2E 통과, 커밋·push(재배포 CI 성공, argocd 롤아웃 대기). 또 RN 앱에 SafeArea 적용(하단탭 겹침 수정) + 실기기 release APK 설치 완료.
- 2026-07-22: **Tallo 서버+웹 온보딩 프로덕션 배포·검증 완료**. polymorph-app(feat tallo + feat oauth-server seed)·polymorph-k8s(secret oauth 변수) push → CI 재빌드 → argocd 롤아웃. oauth `db:seed` 실행해 prod oauth DB에 `tallo` clientId 등록. prod 검증: /api/me Bearer 200(OAUTH_JWT_SECRET 주입 확인)·미인증 401, /devices 로그인 안내, oauth /login?clientId=tallo unknown-client 없음. (인터랙티브 SSO 로그인/마법사 클릭은 브라우저 필요 — 플러밍은 전부 검증됨.)
- 2026-07-22: **Tallo 서버+웹 온보딩 구현 완료(로컬 검증)**. A) oauth-server SSO 통합(clientId `tallo` seed 추가, middleware silent SSO, /auth/callback·set-cookie, getAuthUser=Bearer(RN)+쿠키(웹), /api/me). B) `Device`+`RegistrationSession` 모델 + 마이그레이션 `1_onboarding` 실DB 적용. C) 사용자평면 API `/api/devices`(엔롤/목록/PATCH/DELETE), `/api/registrations`(시작·**번호단위 잠금409**·`/otp` 릴레이·`/complete` ingest토큰발급·`/cancel`) + lazy TTL 만료. D) 웹 서비스 페이지 `/devices`(목록·수동엔롤·등록시작·삭제) + `/registrations/[id]` 마법사(번호표시·OTP 2초 폴링·완료 시 토큰 1회 표시·취소·카운트다운). tsc/build/E2E(로컬, 실DB) 전건 통과, 테스트데이터 정리. **남은 것: 배포(커밋+push→CI) + oauth-server seed 실행(prod oauth DB에 tallo clientId 등록) + k8s secret(OAUTH_JWT_SECRET·NEXT_PUBLIC_OAUTH_SERVER_URL 추가됨) 반영.** 완료 시 토큰의 앱 자동전달(web 표시 대신)은 RN Phase에서 마무리.
- 2026-07-22: **온보딩 모델 개정 — 분산형 확정**. 우리는 앱+웹 플랫폼만 제공(중앙 번호 인프라 없음). 각자 자기 폰에 앱 설치. **웹/앱 로그인=oauth-server SSO**(Tallo에 oauth 통합 신규 필요), 디바이스는 계정 귀속. 번호 확보=자동조회→실패 시 수동. 등록 절차는 **Tallo 웹(신규 프론트엔드)에서 주도**, 앱은 엔롤+OTP 캡처/릴레이. `Device`+`RegistrationSession` 모델. → Tallo scope 확장(oauth 통합 + 웹 UI).
- 2026-07-22: **Phase 1 프로덕션 배포 완료**. polymorph-app(feat+ci)·polymorph-k8s(application+manifests) main push → CI(1m43s 성공, ghcr.io/polym-team/tallo) → argocd sync → `https://tallo.polymorph.co.kr/api/health` 200 LIVE. 프로덕션 E2E 스모크(토큰 발급/입금 적재/조회, cluster→NAS DB) 통과 후 테스트 데이터 정리. DNS는 `*.polymorph.co.kr` 와일드카드로 커버. **Phase 1 종료. 다음 = RN 브릿지 앱(별도 repo).**

# 디자인 토큰 시스템(`@package/theme`) 도입 계획

> 목표: shadcn 공통 컴포넌트는 그대로 두고, **앱마다 액센트/브랜드만 다른 CSS 변수로 주입**해서
> "다 똑같아 보이는" 문제를 없앤다. 색 값을 `@package/config`에 하드코딩하던 방식을
> **CSS 변수 seam** 으로 옮겨, 앱별 테마를 값 교체만으로 적용할 수 있게 한다.

관련 산출물:
- 팔레트 목업(11개 앱): Artifact 보드 (로즈·클레이·골드·그린·틸·시안·블루·인디고·바이올렛·오렌지 + 하우스 블루)
- 이 문서: 토큰 구조 / 마이그레이션 순서 / 오버뷰 페이지 / 문서화 계획

---

## 1. 용어 — "디자인 템플릿"

내부적으로 이 레이어를 **디자인 템플릿**이라 부른다: *틀(제약)은 공유하고, 그 안의 값(테마)은 앱이 자유롭게 채운다.* 틀이 일관성을 지키고, 값이 앱별 개성을 만든다 — AI가 UI를 생성할 때도 이 틀이 가드레일이 된다.

단, **코드/패키지 이름은 정확한 기술 용어**를 쓴다:
- 패키지: `@package/theme`
- 값 = **design tokens** (CSS 변수)
- shadcn은 이름에 노출하지 않는 **구현 디테일** (컴포넌트는 `@package/ui`에 유지)

핵심 경계:
- **컴포넌트**(`@package/ui`)는 copy-and-own — 앱이 필요 시 분기 가능.
- **토큰**(`@package/theme`)은 shared-and-sync — 분기 금지. 앱은 "값만" 오버라이드한다.

---

## 2. 현재 상태 (As-Is)

| 요소 | 현황 |
|---|---|
| `@package/config/tailwind.config.js` | `(contentPaths) => ({...})` 함수형 preset. 색이 `theme.extend.colors`에 **하드코딩** (일부 `hsl(...)`, primary/warning/ring은 hex). `borderRadius`도 리터럴. |
| `@package/config/postcss.config.js` | 앱들이 `require`로 공유. |
| `@package/styles/globals.css` | `@tailwind` 3종 + 스크롤바/줌 방지 유틸. **색 변수·`.dark` 블록 없음.** 워크스페이스 패키지가 아니라 앱이 **상대경로로 import**. |
| `@package/ui` | shadcn 컴포넌트. `next-themes` 이미 의존성에 존재. |
| 앱 그룹 A (jibsayo, bookmark-share, okra, scaffolding) | `baseConfig([...])` 그대로 사용. 자체 색 없음. |
| 앱 그룹 B (rootbeer-mall, autto, official-website) | 자체 `tailwind.config.js`로 base를 **무시**하고 팔레트 독자 정의. |
| 다크모드 | base config에 `darkMode` 키 없음 → 기본 `media`. official-website만 자체 `--color-*` + `.dark` 보유. next-themes(class 방식)와 정합성 미확인. |

**문제**: 앱별 브랜딩 = 각 config를 직접 수정해야 하고, 색 값의 사본이 config·목업·(향후)문서에 흩어져 드리프트한다. 런타임 변수 seam이 없다.

---

## 3. 목표 구조 (To-Be)

```
packages/
  ui/            # shadcn 컴포넌트 (변경 최소)
  theme/         # ★신설 @package/theme
    tokens.css        # :root 기본 토큰 + .dark  (진실의 출처)
    presets/
      oauth.css       # 앱별 테마 (변수 오버라이드만)
      jibsayo.css
      ...             # 11개
    tailwind-preset.js  # colors를 hsl(var(--x)) 로 매핑 + darkMode:'class'
    index.ts / package.json
  config/        # tailwind: theme.tailwind-preset 을 소비 (색 정의 제거)
  styles/        # globals: tokens.css import 추가
```

동작 원리:
1. `tokens.css`가 shadcn 표준 변수를 정의 (`--primary`, `--background`, `--ring`, `--radius`, `.dark { ... }`).
2. tailwind preset이 `primary: 'hsl(var(--primary) / <alpha-value>)'` 식으로 매핑 → 컴포넌트 코드(`bg-primary`, `bg-primary/90`)는 그대로.
3. 각 앱은 `globals.css`에서 자기 preset(`presets/<app>.css`)을 import → `:root` 변수만 덮어써서 브랜드 적용.

---

## 4. 토큰 설계

### 4.1 값 포맷 — HSL 채널 (권장)
변수는 **bare HSL 채널**로 저장한다: `--primary: 221 83% 53%;` → `hsl(var(--primary) / <alpha-value>)`.
이유: shadcn 컴포넌트가 hover 등에서 `bg-primary/90`, `ring-ring/50` 같은 **알파 modifier**를 쓰므로, hex(`var(--primary)`)로는 알파가 깨진다. 구현 시 팔레트 hex → HSL 채널 변환 필요.

### 4.2 앱별로 바뀌는 토큰 (themeable)
`--primary`, `--primary-foreground`, `--ring`, `--accent`, `--accent-foreground` (+필요 시 `--secondary`).
→ 각 `presets/<app>.css`가 이 값만 정의.

### 4.3 전 앱 공통 토큰 (shared)
- 뉴트럴: `--background`, `--foreground`, `--border`, `--input`, `--muted(-foreground)`, `--card(-foreground)`, `--popover(-foreground)`
- semantic: `--danger`, `--warning`, (`--success`)  ← **앱별로 나누지 않음** (유지보수 우선)
- `--radius`
- (옵션) 뉴트럴을 각 앱 액센트 쪽으로 살짝 편향시키는 warm/cool 변형은 후속 과제로 분리.

### 4.4 다크모드
- `tokens.css`에 `.dark { ... }`로 뉴트럴/필요 토큰 재정의.
- tailwind preset에 **`darkMode: 'class'`** 명시 → 이미 있는 `next-themes`와 정합.
- 브랜드 primary는 다크에서 그대로 두되, 대비가 부족한 색(틸·시안·그린)은 밝은 변형을 `.dark`에서 지정.

### 4.5 숫자 스케일(`primary-50..900`, `warning-50..900`) 처리 — ✅ 해결
grep 결과 실사용 거의 없음(`primary-500`이 jibsayo Spinner 1파일 3곳, `warning-<num>` 0곳).
→ **숫자 스케일 제거**, DEFAULT+foreground만 유지. jibsayo Spinner의 `bg-primary-500`은 `bg-primary`로 교체(오늘 기준 동일 색). Phase 0에서 완료.

---

## 5. 앱별 팔레트 (확정본)

| 앱 | primary (버튼) | accent | 상태 | 비고 |
|---|---|---|---|---|
| oauth-server | `#4F46E5` 인디고 | `#6366F1` | 신규 | 인증·신뢰 |
| jibsayo | `#2563EB` 블루 | `#3B82F6` | 신규 | 부동산 데이터 |
| rootbeer-employee-mall | `#B98A7A` 클레이 | `#A15843` 테라코타 | 유지 | 버튼 텍스트 dark |
| autto | `#E6A817` 골드 | `#D69A12` | 유지 | 버튼 텍스트 dark |
| bookmark-share | `#7C3AED` 바이올렛 | `#8B5CF6` | 신규 | |
| okra | `#15803D` 그린 | `#16A34A` | 신규 | 이름 말장난 + 성장 |
| official-website | `#0F766E` 딥틸 | `#14B8A6` 틸 | 유지 | 기존 브랜드 |
| tallo | `#0E7490` 딥시안 | `#06B6D4` 시안 | 신규 | 입금 원장. official 틸과 근접 — 필요 시 조정 |
| direct-feedback | `#E11D48` 로즈 | `#F43F5E` | 신규 | 코멘트·주목 |
| myflighthistory | `#C2410C` 딥오렌지 | `#F97316` 선셋 | 신규 | 항공·골든아워 |
| scaffolding | `#0963FF` 하우스 블루 | `#3B82F6` | 기본 | 라이브러리 레퍼런스 |

- 미정: **donghaeng** (마젠타/퍼플-핑크 구역 예약) — 개발 여부 확정 후 추가.
- 대비: 클레이·골드는 버튼에 dark 텍스트, 틸·시안·그린은 버튼용 딥 톤 별도 사용.

---

## 6. 마이그레이션 순서 (expand → contract)

공유 config를 한 번에 바꾸면 전 앱이 동시에 영향받으므로, **무회귀(expand) → 앱별 적용 → 정리(contract)** 순으로 간다.

**Phase 0 — expand (무회귀)**
1. `@package/theme` 신설: `tokens.css`(현재 파랑 기본값을 **그대로** 변수화) + `tailwind-preset.js`.
2. `@package/config`가 preset을 소비하도록 교체하되 **최종 렌더 색은 오늘과 동일**.
3. `@package/styles/globals.css`에 `tokens.css` import 추가.
→ 이 시점까지 **시각적 변화 0** (검증: 스냅샷/육안).

**Phase 1 — 앱별 적용 (그룹 A 먼저)**
4. jibsayo → bookmark-share → okra 순으로 `presets/<app>.css` 추가 + globals에서 import. **앱 1개 = 커밋 1개 = 시각 변화 1개** (검증 후 다음).
5. scaffolding은 하우스 블루 유지(기본값이라 무변화).

**Phase 2 — 그룹 B 정합화**
6. rootbeer / autto / official: 자체 config의 팔레트를 preset 체계로 이전(변수화). 이미 동작하므로 우선순위 낮음, 앱별로 분리 진행. official-website의 자체 `--color-*`는 표준 토큰명으로 흡수.

**Phase 3 — contract (정리)**
7. 모든 앱이 변수 seam을 쓰면 `@package/config`의 하드코딩 색 리터럴 제거(또는 preset 재노출로 축소).
8. 숫자 스케일 이슈(4.5) 정리.

> 커밋은 argocd 부담을 줄이기 위해 **영향 단위로 분리**하고, 푸시는 사용자 지시가 있을 때만.

---

## 7. 라이브 오버뷰 페이지 (`scaffolding`)

- 이미 UI 쇼케이스인 `apps/scaffolding`에 "앱별 테마 오버뷰" 라우트 추가.
- **`@package/theme`의 presets에서 자동 렌더** (하드코딩 금지) → 토큰이 진실의 출처, 페이지는 파생.
- 각 앱 카드: 팔레트 램프 + 실제 컴포넌트(Button/Badge/Input/Card) 프리뷰 + 토큰 값. 라이트/다크 토글.
- 이 문서 §5의 Artifact 보드가 그 페이지의 프로토타입.

---

## 8. 문서화 (why-doc)

- `packages/ui/CLAUDE.md` (또는 `packages/theme/CLAUDE.md`)에 **원칙/근거만** 기록, **값은 코드(토큰)에만**.
- 담을 내용: "디자인 템플릿" 개념(틀+값), 컴포넌트 vs 토큰 경계, 액센트 하나만 바꾸는 규칙, semantic 공통 원칙, 새 앱에 테마 추가하는 절차, HSL 채널 규약.
- 목적: 사람과 AI 에이전트가 읽는 **정본 컨텍스트**.

---

## 9. 리스크 / 오픈 이슈

1. **숫자 스케일**(§4.5) — 사용처 grep 후 결정 (제거/축소/앱별 생성).
2. **`@package/styles`가 패키지가 아님** — 상대경로 import 유지 vs 정식 패키지화. tokens.css import 경로 영향.
3. **알파 modifier** — HSL 채널 포맷 강제(§4.1). hex 유지 시 `/opacity` 깨짐.
4. **그룹 B 자체 config** — 흡수 범위/우선순위. 무리한 일괄 리네임 금지, 앱별 분리.
5. **다크모드 정합** — `darkMode:'class'` 전환이 기존 `media` 가정 앱에 영향 없는지 확인.
6. **tallo(시안) ↔ official(틸)** 색 근접 — 필요 시 tallo를 에메랄드/슬레이트로 조정.

---

## 10. 다음 액션

- [x] 숫자 스케일 사용처 grep (§4.5) — 제거 결정
- [x] **Phase 0 구현 (무회귀, 검증 완료)**
  - `@package/theme` 신설: `tokens.css`(정본 기본값) + `presets/README.md`
  - `@package/config`: 색을 `hsl(var(--x, 기존값) / <alpha>)`로 변환, 숫자 스케일 제거, radius 변수화
  - jibsayo `Spinner.tsx`: `bg-primary-500` → `bg-primary`
  - 검증: tailwind 컴파일 시 fallback으로 기존 색 재현 + 알파 modifier 동작 확인
- [ ] 팔레트 hex → HSL 채널 변환표 작성 (11개, README에 jibsayo 예시 있음)
- [x] **Phase 1 그룹 A 완료**: jibsayo(블루)·bookmark-share(바이올렛)·okra(그린)
  - 로딩 방식 확정: 레이아웃에서 **자기 preset만** 상대경로 import (order-independent). tokens.css는 다크모드 단계에서 전역 로드.
  - 앱별 커밋 3개.
- [~] Phase 1 나머지 신규 앱 — 조사 결과 **프리셋 방식 부적합**:
  - **myflighthistory**: 토큰 미사용. 자체 "공항 FIDS" 다크 디자인(`--board`/`--fids-*`/`--delay #ff9f38`)이 이미 완성. `bg-primary`·`@package/ui` 0개 → 프리셋 무의미. **self-themed로 분류, 프리셋 불필요.**
  - **direct-feedback**: Tailwind/shadcn 미사용(`className` 0, `style={{` 인라인만 6). 토큰 시스템에 편입하려면 Tailwind+@package/ui 도입 = **별도 마이그레이션**(프리셋 드롭 아님).
  - **tallo**: 자체 config(shared 미사용) → Phase 2 성격.
  - → 결론: 신규 앱 중 프리셋 대상은 그룹 A(완료)뿐. 나머지는 self-themed이거나 별도 편입 과제.
- [x] **scaffolding 오버뷰 페이지 (`/themes`)** — `@package/theme/registry.ts`(단일 소스)에서 자동 렌더, 앱별 토큰을 스코프 주입해 실제 @package/ui 컴포넌트로 프리뷰. 브라우저 검증 완료.
  - registry.ts가 정본. presets/*.css 는 registry에서 생성(`generate:presets`).
- [x] **why-doc 작성** (`packages/theme/CLAUDE.md`) — 틀+값 개념, theme/ui 경계, **프리셋 얇게 유지 결정(primary만)+근거**, HSL 규약, 새 앱 절차, self-themed 예외, fallback 메커니즘
- [~] **전략 재평가 (Phase 2 대체)**: 조사 결과 나머지 8개 앱은 `@package/ui`·`bg-primary` seam을
  **아예 소비하지 않음** (각자 own-config/self-themed/인라인). 일괄 편입은 대규모 UI 리팩토링이라
  가치 대비 위험이 큼. → **"jibsayo를 완성 레퍼런스로 만들고, 앱별로 하나씩 리팩토링"** 전략으로 전환.
- [x] **jibsayo 리팩토링 (레퍼런스 앱)** — 하드코딩 색을 토큰으로:
  - 브랜드 blue → `primary` (nav 활성·링크·선택 마커·소프트 hover)
  - 에러 red → `danger` (ErrorBoundary·auth·로그아웃)
  - 가격 상승/하락 red/blue → **앱 로컬 토큰** `priceUp`/`priceDown` (presets/jibsayo.css + jibsayo tailwind 확장)
  - 유지: 즐겨찾기 별(yellow)·차트 hex·gray 뉴트럴
  - 애매(미결): `ApartItem`의 신규(red)/최근(blue) 카테고리 배지 → 남겨둠
  - 검증: tailwind 컴파일로 새 클래스 정상 생성 확인
- [x] **다크모드 도입** — `tokens.css`에 `.dark` 블록(뉴트럴만 뒤집고 브랜드 유지) + `@package/config` `darkMode:'class'` + `postcss-import`로 `styles/globals.css`가 `tokens.css` 전역 @import + scaffolding `/themes`에 next-themes 토글. 브라우저로 라이트/다크 검증 완료.
  - tokens.css에서 브랜드 토큰(--primary/--ring) 제거 → preset과 로드순서 충돌 제거(브랜드는 preset/fallback).
- [ ] 앱별 순차 리팩토링: oauth·rootbeer·autto·official·tallo (각 앱이 seam을 쓰게 하려면 UI 편입 필요 — 앱별 판단)
- [x] **presets 생성 자동화** — `packages/theme/scripts/generate-presets.ts` (`generate:presets`). registry가 단일 소스, extraTokens로 앱 전용 토큰(jibsayo price-up/down) 포함. 무회귀(값 동일) 확인.
- [x] **tallo 편입 + 재설계 + 입금 내역(원장) 화면 신규** — 인라인→shared config/@package/ui, 시안 preset, 홈/감시계좌/입금내역, 삭제 Dialog. tsc+prod build 검증. Next15 라우트 params 수정, prisma postinstall.
- [x] **모노레포 prisma client 충돌 해결** — jibsayo·tallo·okra를 앱별 output(`../src/generated/prisma`)으로 분리(나머지 6앱 패턴과 통일). import `@prisma/client`→`@/generated/prisma`, okra postinstall 추가. 3앱 동시 tsc 통과.
- [ ] (후속) 앱별 다크 토글 배치 / jibsayo next@15 업그레이드

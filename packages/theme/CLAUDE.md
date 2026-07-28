# @package/theme — 디자인 테마 (틀 + 값)

이 패키지는 polymorph 앱 패밀리의 **디자인 값 레이어**입니다. 사람과 AI 에이전트가
UI를 일관되게 만들기 위한 **정본 컨텍스트**이기도 합니다. 값(hex/채널)이 아니라
**원칙**을 기록합니다 — 실제 값은 `registry.ts`와 `presets/*.css`에 있습니다.

> 전체 도입 계획·마이그레이션 순서는 `polymorph-app/docs/design-token-system-plan.md` 참조.

## 핵심 개념 — "디자인 템플릿"

**틀(제약)은 공유하고, 그 안의 값(테마)은 앱이 자유롭게 채운다.** 틀이 일관성을 지키고,
값이 앱별 개성을 만든다. AI가 UI를 생성할 때도 이 틀이 가드레일 역할을 한다.

## 경계 — theme vs ui

| | 레이어 | 분기 정책 |
|---|---|---|
| `@package/theme` | **값**: 토큰 + 앱별 프리셋 + registry 메타 | 토큰은 **shared-and-sync** (분기 금지, 값만 오버라이드) |
| `@package/ui` | **구조**: shadcn 컴포넌트 | 컴포넌트는 **copy-and-own** (앱이 필요 시 분기 가능) |

theme에는 **컴포넌트 구조가 들어오지 않는다.** 색·radius 같은 값과 그 메타데이터만.

## 파일

- `tokens.css` — base 토큰 정본(전 앱 공통 기본값). ⚠️ 현재는 앱별로 로드하지 않는다
  (다크모드 단계에서 전역 1회 로드 예정). base 값은 `@package/config`의 var() fallback이 반영.
- `presets/<app>.css` — 앱별 브랜드. **`--primary` 계열만** 오버라이드한다.
- `registry.ts` — 오버뷰/툴링용 메타데이터 **단일 소스**. scaffolding `/themes`가 여기서 렌더.
- 색 매핑은 `@package/config/tailwind.config.js`에 있다: `hsl(var(--x, <fallback>) / <alpha-value>)`.

## 규칙

1. **프리셋은 얇게 간다** — 앱은 `--primary` / `--primary-foreground` / `--ring`만 정의한다.
   - *왜*: 일관성·유지보수 우선. primary 하나만 바꿔도 버튼·링크·포커스·뱃지·활성상태가
     그 색으로 물들어 정체성은 충분하다. 오버라이드 토큰이 적을수록 패밀리가 일관되고
     드리프트가 준다. 내부 도구 위주인 이 패밀리엔 이게 적정선이다.
   - 개성은 "한 앱 안의 다색 팔레트"가 아니라 **패밀리 전체의 색상 분포**로 만든다.
2. **뉴트럴·semantic(danger/warning/success)·radius는 공유한다** — 앱별로 나누지 않는다.
   (semantic을 공통으로 두는 게 유지보수에 유리)
3. **값 포맷은 bare HSL 채널** `H S% L%` — hex 금지. → `bg-primary/90` 같은 알파 modifier 유지.
4. **앱은 자기 preset만 로드한다** (order-independent). base는 config fallback이 제공.

## 새 앱에 테마 추가 절차

전제: 그 앱이 shared config(`@package/config`) + Tailwind + `@package/ui`를 쓸 때만 해당.

1. `registry.ts`에 항목 추가 (primary 채널, hue, hex, status 등).
2. `presets/<app>.css` 생성 — `--primary` / `--primary-foreground` / `--ring`만.
3. 앱 `layout.tsx`에서 globals import **위에** 자기 preset을 상대경로로 import.
4. `/themes` 오버뷰에서 확인.

> ⚠️ 현재 `presets/*.css`와 `registry.ts`는 **수기로 동기화**한다. (추후 registry에서 CSS 생성 권장)

## 언제 이 시스템에서 빠지나 (self-themed / own-config)

모든 앱을 같은 틀에 강제하지 않는다. 다음은 **의도적 예외**로 두고 편입하지 않는다:

- 강한 독자 컨셉(예: myflighthistory의 공항 FIDS 다크 디자인)
- 마케팅 사이트(official-website) — 리치한 표현이 필요
- Tailwind/shadcn을 아예 안 쓰는 앱(direct-feedback — 인라인 스타일)

무리하게 토큰 시스템으로 끌어오지 말 것. `registry.ts`의 `status`로 상태를 표기한다.

## fallback 메커니즘 (무회귀의 핵심)

`@package/config`가 색을 `hsl(var(--primary, <하우스 기본값>) / <alpha>)`로 매핑하므로,
프리셋을 로드하지 않은 앱도 **하우스 기본값(블루)으로 정상 렌더**된다. 프리셋을 로드한
앱만 브랜드가 입혀진다. 덕분에 앱별 적용을 하나씩 안전하게 굴릴 수 있다.

# presets — 앱별 테마

각 앱은 `<app>.css` 하나로 자기 브랜드를 정의한다. **`tokens.css`의 일부 토큰만 덮어쓴다** — 뉴트럴/semantic은 그대로 두고, 보통 `--primary` / `--primary-foreground` / `--ring` 정도만 바꾼다. (틀은 공유, 값만 교체)

## 규약

- 값은 **bare HSL 채널** (`H S% L%`). hex 아님. → 알파 modifier 유지.
- 뉴트럴(`--background`, `--border` 등)·semantic(`--danger`, `--warning`)은 **오버라이드 금지** (공통 유지).
- 다크 대비가 부족한 브랜드색은 `.dark` 블록에서 밝은 변형 지정(다크모드 단계에서).

## 템플릿

```css
/* presets/<app>.css */
:root {
  --primary: <H S% L%>;
  --primary-foreground: <H S% L%>;
  --ring: <H S% L%>;
}
```

## 예시 — jibsayo (블루 #2563EB)

```css
:root {
  --primary: 221 83% 53%;        /* #2563EB */
  --primary-foreground: 0 0% 100%;
  --ring: 217 91% 60%;           /* #3B82F6 */
}
```

## 로딩 (Phase 1)

앱 레이아웃에서 **자기 프리셋만** import한다 (globals.css 위에, 상대경로):

```ts
import '../../../../packages/theme/presets/jibsayo.css';
import '../../../../packages/styles/globals.css';
```

- base 뉴트럴/semantic은 `@package/config`의 `hsl(var(--x, <기본값>) / <alpha>)` fallback이
  이미 제공하므로, 프리셋은 `--primary` 등 브랜드 토큰만 정의하면 된다.
- `tokens.css`(정본 base)를 앱마다 로드하지 않는 이유: preset과 둘 다 `:root`라
  로드 순서(특히 eslint import 정렬)에 따라 base가 브랜드를 덮어쓸 수 있다.
  `tokens.css`는 정본 정의로 유지하고, **다크모드 단계에서 전역으로 1회 로드**한다.
- 프리셋을 로드하지 않은 앱은 fallback(하우스 블루)으로 정상 렌더된다.

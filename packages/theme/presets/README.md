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

앱 레이아웃에서 `tokens.css` 다음에 자기 프리셋을 import:

```ts
import '@package/theme/tokens.css';
import '@package/theme/presets/jibsayo.css';
```

> 참고: 현재 `@package/config`는 `hsl(var(--x, <기본값>) / <alpha>)` 형태라, 프리셋을
> 로드하지 않은 앱도 fallback(하우스 블루)으로 정상 렌더된다. 프리셋을 로드한 앱만 브랜드가 입혀진다.

/**
 * registry.ts → presets/*.css 생성기 (단일 소스).
 *
 * status === 'preset' 인 앱마다 presets/<app>.css 를 생성한다:
 *   --primary / --primary-foreground / --ring(=primary) + extraTokens.
 *
 * 실행: pnpm --filter @package/theme generate:presets
 * ⚠️ presets/*.css 는 직접 편집하지 말 것 — registry.ts 를 고치고 이 스크립트를 재실행한다.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_THEMES } from '../registry';

const here = dirname(fileURLToPath(import.meta.url));
const presetsDir = resolve(here, '../presets');

let count = 0;
for (const t of APP_THEMES) {
  if (t.status !== 'preset') continue;

  const lines = [
    '/* AUTO-GENERATED from registry.ts — 직접 편집 금지.',
    '   값 변경은 registry.ts 수정 후 `pnpm --filter @package/theme generate:presets` 실행. */',
    `/* ${t.app} — ${t.hue} ${t.hex}${t.note ? ` (${t.note})` : ''} */`,
    ':root {',
    `  --primary: ${t.primary};`,
    `  --primary-foreground: ${t.primaryForeground};`,
    `  --ring: ${t.primary};`,
  ];
  for (const [key, value] of Object.entries(t.extraTokens ?? {})) {
    lines.push(`  ${key}: ${value};`);
  }
  lines.push('}', '');

  writeFileSync(resolve(presetsDir, `${t.app}.css`), lines.join('\n'));
  count += 1;
  // eslint-disable-next-line no-console
  console.log(`generated presets/${t.app}.css`);
}
// eslint-disable-next-line no-console
console.log(`\n✓ ${count} preset(s) generated from registry.ts`);

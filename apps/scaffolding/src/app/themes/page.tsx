import { APP_THEMES, type AppTheme, type ThemeStatus } from '@package/theme/registry';
import { AppSymbol } from '@package/theme/symbols';
import { Badge, Button, Input, Typography } from '@package/ui';

import { ThemeToggle } from './ThemeToggle';

export const metadata = {
  title: '앱별 테마 오버뷰 · Polymorph',
  description: '@package/theme 레지스트리에서 자동 렌더되는 앱별 브랜드 팔레트',
};

const STATUS_LABEL: Record<ThemeStatus, string> = {
  preset: '프리셋 적용',
  'own-config': '자체 config',
  'self-themed': 'self-themed',
  default: '기본',
};

const STATUS_STYLE: Record<ThemeStatus, string> = {
  preset: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  'own-config': 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'self-themed': 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400',
  default: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
};

/** HSL 채널 → hsl() 문자열 */
const hsl = (channels: string) => `hsl(${channels})`;
/** primary 를 white/black 과 섞어 램프 스텝 생성 */
const mix = (channels: string, pct: number, base: 'white' | 'black') =>
  `color-mix(in srgb, ${hsl(channels)} ${pct}%, ${base})`;

function ThemeCard({ t }: { t: AppTheme }) {
  // 카드 내부 컴포넌트가 이 앱 색으로 렌더되도록 토큰을 스코프 주입
  const scope = {
    '--primary': t.primary,
    '--primary-foreground': t.primaryForeground,
    '--ring': t.primary,
  } as React.CSSProperties;

  const ramp = [
    mix(t.primary, 14, 'white'),
    mix(t.primary, 38, 'white'),
    mix(t.primary, 66, 'white'),
    hsl(t.primary),
    mix(t.primary, 78, 'black'),
  ];

  return (
    <div
      style={scope}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm"
    >
      <div className="h-1.5" style={{ background: hsl(t.primary) }} />
      <div className="flex flex-col gap-4 p-5">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AppSymbol name={t.app} className="h-4 w-4" style={{ color: t.hex }} />
              <span className="text-base font-semibold tracking-tight">{t.label}</span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{t.domain}</div>
            {t.note ? <div className="mt-1 text-xs text-muted-foreground">{t.note}</div> : null}
          </div>
          <div className="flex flex-none flex-col items-end gap-1">
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
              {t.brand}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[t.status]}`}
            >
              {STATUS_LABEL[t.status]}
            </span>
          </div>
        </div>

        {/* ramp */}
        <div className="flex overflow-hidden rounded-md border border-border">
          {ramp.map((c, i) => (
            <div key={i} className="h-9 flex-1" style={{ background: c }} />
          ))}
        </div>

        {/* live component preview (scoped tokens) */}
        <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/40 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm">
              Primary
            </Button>
            <Button variant="primary-light" size="sm">
              Soft
            </Button>
            <Button variant="outline" size="sm">
              Outline
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">Badge</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <Input placeholder="입력 필드 (포커스 링)" className="max-w-full" />
        </div>

        {/* token values */}
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm border border-border"
              style={{ background: t.hex }}
            />
            {t.hex}
          </span>
          <span>{t.primary}</span>
        </div>
      </div>
    </div>
  );
}

export default function ThemesOverview() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-8">
        <div className="mb-2 flex items-start justify-between gap-4">
          <Typography variant="h1">앱별 테마 오버뷰</Typography>
          <ThemeToggle />
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1">@package/theme</code> 레지스트리에서 자동
          렌더됩니다. 각 카드의 버튼·뱃지·입력은 해당 앱의 토큰을 주입해 실제{' '}
          <code className="rounded bg-muted px-1">@package/ui</code> 컴포넌트로 그린 것입니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>
            <b className="text-green-700 dark:text-green-400">프리셋 적용</b> — 토큰 seam으로 실제 반영
          </span>
          <span>
            <b className="text-amber-700 dark:text-amber-400">자체 config</b> — 앱 자체 팔레트(정합화 대상)
          </span>
          <span>
            <b className="text-gray-500 dark:text-gray-400">self-themed</b> — 독자 디자인, 토큰 미편입
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {APP_THEMES.map((t) => (
          <ThemeCard key={t.app} t={t} />
        ))}
      </div>
    </main>
  );
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 워밍 팔레트 — CSS 변수 구동(globals.css :root/.dark). 라이트/다크 자동 전환.
        paper: {
          DEFAULT: 'hsl(var(--rb-paper) / <alpha-value>)',
          card: 'hsl(var(--rb-paper-card) / <alpha-value>)',
        },
        ink: {
          900: 'hsl(var(--rb-ink-900) / <alpha-value>)',
          600: 'hsl(var(--rb-ink-600) / <alpha-value>)',
          400: 'hsl(var(--rb-ink-400) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'hsl(var(--rb-line) / <alpha-value>)',
          soft: 'hsl(var(--rb-line-soft) / <alpha-value>)',
        },
        clay: {
          50: 'hsl(var(--rb-clay-50) / <alpha-value>)',
          500: 'hsl(var(--rb-clay-500) / <alpha-value>)',
          600: 'hsl(var(--rb-clay-600) / <alpha-value>)',
        },
        sage: {
          50: 'hsl(var(--rb-sage-50) / <alpha-value>)',
          500: 'hsl(var(--rb-sage-500) / <alpha-value>)',
          600: 'hsl(var(--rb-sage-600) / <alpha-value>)',
        },
        ocher: {
          50: 'hsl(var(--rb-ocher-50) / <alpha-value>)',
          500: 'hsl(var(--rb-ocher-500) / <alpha-value>)',
          600: 'hsl(var(--rb-ocher-600) / <alpha-value>)',
        },
        terra: {
          50: 'hsl(var(--rb-terra-50) / <alpha-value>)',
          500: 'hsl(var(--rb-terra-500) / <alpha-value>)',
          600: 'hsl(var(--rb-terra-600) / <alpha-value>)',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43, 39, 36, 0.04), 0 2px 8px rgba(43, 39, 36, 0.05)',
        lift: '0 6px 22px rgba(43, 39, 36, 0.08)',
      },
      fontFamily: {
        sans: [
          'var(--font-pretendard)',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        // 에디토리얼 디스플레이 세리프 (한글 대응)
        serif: ['var(--font-serif)', 'Nanum Myeongjo', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

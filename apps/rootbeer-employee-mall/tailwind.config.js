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
        // 상품 사진 플레이트(항상 흰색)
        plate: 'hsl(var(--rb-plate) / <alpha-value>)',
        // 폴리모프 디자인시스템 토큰 — @package/ui 컴포넌트가 소비. globals 의 seam 이
        // 이 토큰들을 워밍 팔레트에 매핑한다(라이트/다크 자동).
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
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
  // @package/ui 의 radix 기반 컴포넌트(Select/Dialog 등) enter/leave 애니메이션용
  plugins: [require('tailwindcss-animate')],
};

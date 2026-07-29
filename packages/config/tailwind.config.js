/** @type {import('tailwindcss').Config} */

module.exports = (contentPaths = []) => ({
  darkMode: 'class',
  content: [
    ...contentPaths,
    // packages 폴더의 소스 파일들만 포함 (node_modules 제외)
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/index.{js,ts}',
  ],
  theme: {
    extend: {
      fontSize: {
        base: '1rem',
      },
      maxWidth: {
        'screen-xs': '480px',
      },
      // 색은 @package/theme/tokens.css 의 CSS 변수를 소비한다.
      // var() fallback = 기존 하우스 값이라, 프리셋을 로드하지 않은 앱도 무회귀로 렌더된다.
      // (앱별 브랜드는 presets/<app>.css 가 --primary / --ring 등을 오버라이드해서 만든다)
      colors: {
        border: 'hsl(var(--border, 214.3 31.8% 91.4%) / <alpha-value>)',
        input: 'hsl(var(--input, 214.3 31.8% 91.4%) / <alpha-value>)',
        ring: 'hsl(var(--ring, 218 100% 52%) / <alpha-value>)',
        background: 'hsl(var(--background, 0 0% 100%) / <alpha-value>)',
        foreground: 'hsl(var(--foreground, 222.2 84% 4.9%) / <alpha-value>)',
        default: {
          DEFAULT: 'hsl(var(--default, 210 40% 96%) / <alpha-value>)',
          foreground: 'hsl(var(--default-foreground, 222.2 84% 4.9%) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary, 218 100% 52%) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground, 0 0% 100%) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary, 220 13% 20%) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground, 0 0% 98%) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger, 0 84.2% 60.2%) / <alpha-value>)',
          foreground: 'hsl(var(--danger-foreground, 210 40% 98%) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning, 44 100% 70%) / <alpha-value>)',
          foreground: 'hsl(var(--warning-foreground, 222.2 84% 4.9%) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted, 210 40% 96%) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground, 215.4 16.3% 46.9%) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent, 210 40% 96%) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground, 222.2 84% 4.9%) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover, 0 0% 100%) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground, 222.2 84% 4.9%) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card, 0 0% 100%) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground, 222.2 84% 4.9%) / <alpha-value>)',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius, 0.75rem)',
        lg: 'calc(var(--radius, 0.75rem) + 0.25rem)',
        md: 'var(--radius, 0.75rem)',
        sm: 'calc(var(--radius, 0.75rem) - 0.25rem)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addBase }) {
      addBase({
        html: { fontSize: '16px' },
        body: { fontSize: '16px' },
        '@media (min-width: 1024px)': {
          html: { fontSize: '14px' },
          body: { fontSize: '14px' },
        },
      });
    },
  ],
});

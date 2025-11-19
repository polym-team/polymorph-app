/** @type {import('tailwindcss').Config} */
const BASE_FONT_SIZE = '16px';

module.exports = (contentPaths = []) => ({
  content: [
    ...contentPaths,
    // packages 폴더의 소스 파일들만 포함 (node_modules 제외)
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/index.{js,ts}',
  ],
  theme: {
    extend: {
      fontSize: {
        base: BASE_FONT_SIZE,
      },
      colors: {
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: '#0963FF',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        default: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
        primary: {
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0963FF',
          600: '#0057E6',
          700: '#0049BF',
          800: '#003C99',
          900: '#002E73',
          DEFAULT: '#0963FF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
        danger: {
          DEFAULT: 'hsl(0 84.2% 60.2%)',
          foreground: 'hsl(210 40% 98%)',
        },
        warning: {
          50: '#FFF8E6',
          100: '#FFF1CC',
          200: '#FFE399',
          300: '#FFD666',
          400: '#FFC833',
          500: '#FFBB00',
          600: '#E6A900',
          700: '#BF8C00',
          800: '#997000',
          900: '#735300',
          DEFAULT: '#FFD666',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
        muted: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(215.4 16.3% 46.9%)',
        },
        accent: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
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
        html: { fontSize: BASE_FONT_SIZE },
        body: { fontSize: BASE_FONT_SIZE },
      });
    },
  ],
});

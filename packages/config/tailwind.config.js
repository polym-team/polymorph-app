/** @type {import('tailwindcss').Config} */
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
        base: '14px',
      },
      colors: {
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: 'hsl(238 75% 65%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        default: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(222.2 84% 4.9%)',
        },
        primary: {
          DEFAULT: 'hsl(238 75% 65%)',
          foreground: 'hsl(0 0% 100%)',
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
          DEFAULT: 'hsl(45 93% 63%)',
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
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
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
        html: { fontSize: '14px' },
        body: { fontSize: '14px' },
      });
    },
  ],
});

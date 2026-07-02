/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 배경 / 표면
        paper: {
          DEFAULT: '#FBF9F6', // 따뜻한 오프화이트 페이지 배경
          card: '#FFFFFF', // 카드 표면
        },
        // 텍스트 (웜 차콜 계열)
        ink: {
          900: '#2B2724', // 제목·본문
          600: '#6F6660', // 보조 텍스트
          400: '#A79E96', // 라벨·muted
        },
        // 헤어라인 보더
        line: {
          DEFAULT: '#ECE7E0',
          soft: '#F3EFEA',
        },
        // 포인트 (dusty rose / clay)
        clay: {
          50: '#F3E9E4',
          500: '#B98A7A',
          600: '#A2745F',
        },
        // 서브 / 성공 (sage)
        sage: {
          50: '#EAEFEA',
          500: '#8C9A8E',
          600: '#6F7E72',
        },
        // 경고 (ocher)
        ocher: {
          50: '#F6EEDD',
          500: '#C9A15A',
          600: '#A9843F',
        },
        // 위험 / 품절 / 삭제 (terracotta)
        terra: {
          50: '#F6E7E1',
          500: '#C06B54',
          600: '#A5553F',
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
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f0f7ff',
          100: '#e0efff',
          500: '#6c5ce7',
          600: '#5a4bd1',
        },
        mint: {
          50: '#f0fdf9',
          100: '#ccfbef',
          500: '#00b894',
          600: '#00a381',
        },
      },
    },
  },
  plugins: [],
};

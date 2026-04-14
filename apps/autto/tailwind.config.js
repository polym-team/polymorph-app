/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lotto: {
          50: '#fdf7e8',
          100: '#faecc5',
          500: '#e6a817',
          600: '#cc9415',
        },
      },
    },
  },
  plugins: [],
};

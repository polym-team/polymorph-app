/** @type {import('tailwindcss').Config} */
module.exports = (contentPaths = []) => ({
  content: [
    ...contentPaths,
    // packages 폴더의 소스 파일들만 포함 (node_modules 제외)
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/index.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});

const baseConfig = require('../../packages/config/tailwind.config.js');

const config = baseConfig(['./src/**/*.{js,ts,jsx,tsx,mdx}']);

// jibsayo 도메인 색 — 가격 상승/하락 (presets/jibsayo.css 의 CSS 변수 소비)
config.theme.extend.colors = {
  ...config.theme.extend.colors,
  priceUp: 'hsl(var(--price-up, 0 72% 51%) / <alpha-value>)',
  priceDown: 'hsl(var(--price-down, 221 83% 53%) / <alpha-value>)',
};

module.exports = config;

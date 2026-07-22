import { defineConfig } from 'tsup';

export default defineConfig([
  // npm 소비자용 라이브러리 번들 (ESM + CJS + 타입)
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  // 확장도구 content_scripts 용 IIFE — globalThis.ElementInspector
  {
    entry: { 'element-inspector': 'src/global.ts' },
    format: ['iife'],
    globalName: 'ElementInspector',
    outExtension: () => ({ js: '.global.js' }),
    minify: true,
    sourcemap: false,
  },
]);

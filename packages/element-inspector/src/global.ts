// IIFE 진입점 — 빌드 시 globalThis.ElementInspector 로 노출된다.
// 확장도구(content_scripts, ES module import 불가)가 vendor 파일로 로드해 쓴다.
export * from './index';

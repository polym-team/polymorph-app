/**
 * @package/theme 앱별 테마 레지스트리 (단일 소스)
 *
 * scaffolding 오버뷰 페이지가 이 데이터에서 자동 렌더한다.
 * `primary`/`primaryForeground`는 HSL 채널("H S% L%")로, 미리보기 wrapper에
 * CSS 변수로 주입해 실제 @package/ui 컴포넌트를 각 앱 색으로 렌더한다.
 *
 * status:
 *   preset      — @package/theme/presets/<app>.css 로 실제 적용됨(토큰 seam)
 *   own-config  — 앱 자체 tailwind config로 색 보유(추후 seam으로 정합화 대상)
 *   self-themed — Tailwind/shadcn 토큰 미사용, 독자 디자인(편입 대상 아님)
 *   default     — 하우스 기본값(레퍼런스)
 *
 * presets/*.css 는 이 레지스트리에서 자동 생성한다(단일 소스):
 *   pnpm --filter @package/theme generate:presets
 * 앱 전용 추가 토큰은 extraTokens 필드로 등록하면 함께 생성된다. presets/*.css 는 직접 편집 금지.
 */
export type ThemeStatus = 'preset' | 'own-config' | 'self-themed' | 'default';
export type BrandTag = '신규' | '유지' | '기본';

export interface AppTheme {
  app: string;
  label: string;
  domain?: string;
  hue: string;
  hex: string;
  primary: string;
  primaryForeground: string;
  status: ThemeStatus;
  brand: BrandTag;
  note?: string;
  /** 앱 전용 추가 토큰 (예: jibsayo 가격 상승/하락). presets/<app>.css 에 함께 생성된다. */
  extraTokens?: Record<string, string>;
}

export const APP_THEMES: AppTheme[] = [
  {
    app: 'oauth-server',
    label: 'oauth-server',
    domain: 'oauth.polymorph.co.kr',
    hue: '인디고',
    hex: '#4F46E5',
    primary: '243 75% 59%',
    primaryForeground: '0 0% 100%',
    status: 'preset',
    brand: '신규',
    note: '인증·신뢰의 기준점 (재설계 완료)',
  },
  {
    app: 'jibsayo',
    label: 'jibsayo',
    domain: '부동산 거래 정보',
    hue: '블루',
    hex: '#2563EB',
    primary: '221 83% 53%',
    primaryForeground: '0 0% 100%',
    status: 'preset',
    brand: '신규',
    note: '데이터를 신뢰감 있게',
    // 도메인 색 — 한국 부동산 관례: 빨강=상승, 파랑=하락 (jibsayo tailwind에서 priceUp/priceDown 로 매핑)
    extraTokens: {
      '--price-up': '0 72% 51%',
      '--price-down': '221 83% 53%',
    },
  },
  {
    app: 'rootbeer-employee-mall',
    label: 'rootbeer-mall',
    domain: '사내 공동구매',
    hue: '클레이',
    hex: '#B98A7A',
    primary: '15 31% 60%',
    primaryForeground: '24 20% 14%',
    status: 'own-config',
    brand: '유지',
    note: '따뜻한 에디토리얼 커머스',
  },
  {
    app: 'autto',
    label: 'autto',
    domain: 'autto.polymorph.co.kr',
    hue: '골드',
    hex: '#E6A817',
    primary: '42 82% 50%',
    primaryForeground: '24 20% 14%',
    status: 'preset',
    brand: '유지',
    note: '로또·행운',
  },
  {
    app: 'bookmark-share',
    label: 'bookmark-share',
    domain: '북마크 공유',
    hue: '바이올렛',
    hex: '#7C3AED',
    primary: '262 83% 58%',
    primaryForeground: '0 0% 100%',
    status: 'preset',
    brand: '신규',
    note: '수집·공유의 산뜻함',
  },
  {
    app: 'okra',
    label: 'okra',
    domain: 'OKR 관리',
    hue: '그린',
    hex: '#15803D',
    primary: '142 72% 29%',
    primaryForeground: '0 0% 100%',
    status: 'preset',
    brand: '신규',
    note: '성장 + 이름(오크라)',
  },
  {
    app: 'official-website',
    label: 'official-website',
    domain: 'polymorph.co.kr',
    hue: '틸',
    hex: '#14B8A6',
    primary: '173 80% 40%',
    primaryForeground: '0 0% 100%',
    status: 'own-config',
    brand: '유지',
    note: '모던·테크',
  },
  {
    app: 'tallo',
    label: 'tallo',
    domain: '입금 원장',
    hue: '시안',
    hex: '#06B6D4',
    primary: '193 82% 31%',
    primaryForeground: '0 0% 100%',
    status: 'preset',
    brand: '신규',
    note: '핀테크 원장·정밀',
  },
  {
    app: 'direct-feedback',
    label: 'direct-feedback',
    domain: '화면 코멘트 리뷰',
    hue: '로즈',
    hex: '#E11D48',
    primary: '347 77% 50%',
    primaryForeground: '0 0% 100%',
    status: 'self-themed',
    brand: '신규',
    note: '인라인 스타일 앱 — 토큰 미편입(제안 색)',
  },
  {
    app: 'myflighthistory',
    label: 'myflighthistory',
    domain: '항공편 기록',
    hue: '오렌지',
    hex: '#F97316',
    primary: '25 95% 53%',
    primaryForeground: '0 0% 100%',
    status: 'self-themed',
    brand: '유지',
    note: '자체 공항 FIDS 다크 디자인 (오렌지 내장)',
  },
  {
    app: 'scaffolding',
    label: 'scaffolding',
    domain: 'UI 쇼케이스',
    hue: '하우스 블루',
    hex: '#0963FF',
    primary: '218 100% 52%',
    primaryForeground: '0 0% 100%',
    status: 'default',
    brand: '기본',
    note: '라이브러리 레퍼런스',
  },
];

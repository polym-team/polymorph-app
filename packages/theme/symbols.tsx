import * as React from 'react';

/**
 * 앱별 브랜드 심볼 (24x24 라인 글리프, currentColor stroke).
 * 키는 registry.ts 의 `app` 과 동일 → 색(registry)과 심볼(여기)을 같은 키로 짝짓는다.
 * 색은 소비 측에서 className/style 의 color 로 지정한다.
 */
const PATHS: Record<string, React.ReactNode> = {
  'oauth-server': <path d="M12 3 5 6v6c0 4.2 2.8 6.9 7 8 4.2-1.1 7-3.8 7-8V6z" />,
  jibsayo: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
    </>
  ),
  okra: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  autto: <path d="M12 3l1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9z" />,
  'bookmark-share': <path d="M7 3h10v18l-5-4-5 4z" />,
  'official-website': <path d="M12 3l7.5 4.5v9L12 21l-7.5-4.5v-9z" />,
  tallo: (
    <>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v6c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
    </>
  ),
  myflighthistory: (
    <>
      <path d="M21 3 3 10.5l7 2.5 2.5 7z" />
      <path d="M21 3 10 13" />
    </>
  ),
  'rootbeer-employee-mall': (
    <>
      <path d="M6 8h12l-1 12H7z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
  'direct-feedback': (
    <>
      <path d="M4 5h16v10H10l-4 3v-3H4z" />
      <path d="M8.5 10h7" />
    </>
  ),
  scaffolding: (
    <>
      <path d="M9 6 4 12l5 6" />
      <path d="M15 6l5 6-5 6" />
    </>
  ),
};

export type AppSymbolName = keyof typeof PATHS;

export interface AppSymbolProps extends React.SVGProps<SVGSVGElement> {
  /** registry.ts 의 app 키 (예: 'jibsayo', 'oauth-server') */
  name: string;
}

export function AppSymbol({ name, ...props }: AppSymbolProps) {
  const paths = PATHS[name];
  if (!paths) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths}
    </svg>
  );
}

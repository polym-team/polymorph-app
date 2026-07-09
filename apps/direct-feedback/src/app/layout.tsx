import type { ReactNode } from 'react';

export const metadata = {
  title: 'DirectFeedback',
  description: '화면 엘리먼트에 코멘트를 남겨 개발자/AI 에게 전달',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

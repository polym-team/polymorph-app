import type { Metadata, Viewport } from 'next';

import '../../../../packages/styles/globals.css';

export const metadata: Metadata = {
  title: '점검 중 · Polymorph',
  description: '서비스 점검 중입니다',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}

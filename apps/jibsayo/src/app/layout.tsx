import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Toaster } from '@package/ui';

import { GlobalConfirmDialog } from '@/widgets/ui/GlobalConfirmDialog';

import '../../../../packages/styles/globals.css';
import { ConfigProvider } from './components/ConfigProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FirebaseInitializer } from './components/FirebaseInitializer';
import { QueryClientProvider } from './components/QueryClientProvider';

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicons/favicon.ico',
    apple: '/favicons/apple-touch-icon.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/favicons/favicon.ico',
      },
    ],
  },
  manifest: '/favicons/site.webmanifest',
  // --
  title: {
    default: '집사요 - 실거래가 기반 부동산 정보 플랫폼',
    template: '%s | 집사요',
  },
  description:
    '실시간 실거래가 데이터로 신뢰할 수 있는 부동산 정보를 확인하세요. 아파트 실거래가 조회, 시세 추이, 거래 비교까지 한 곳에서.',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover',
  openGraph: {
    title: '집사요 - 실거래가 기반 부동산 정보 플랫폼',
    description:
      '실시간 실거래가 데이터로 신뢰할 수 있는 부동산 정보를 확인하세요.',
    siteName: '집사요',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary',
    title: '집사요 - 실거래가 기반 부동산 정보 플랫폼',
    description:
      '실시간 실거래가 데이터로 신뢰할 수 있는 부동산 정보를 확인하세요.',
  },
  // --
  verification: {
    other: {
      'naver-site-verification': 'ece171b0e7aac40448f029826c7aea43c84de025',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center text-sm text-gray-300">
                불러오는 중...
              </div>
            }
          >
            <ConfigProvider>
              <QueryClientProvider>
                <FirebaseInitializer />
                <Toaster />
                <GlobalConfirmDialog />
                {children}
              </QueryClientProvider>
            </ConfigProvider>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}

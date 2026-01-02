import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Toaster } from '@package/ui';

import '../../../../packages/styles/globals.css';
import { ConfigProvider } from './components/ConfigProvider';
import { FirebaseInitializer } from './components/FirebaseInitializer';
import { QueryClientProvider } from './components/QueryClientProvider';

export const metadata: Metadata = {
  icons: {
    icon: '/assets/favicon.ico',
  },
  title: '집사요 - 실거래가 기반 부동산 정보 플랫폼',
  description:
    '실시간 실거래가 데이터로 신뢰할 수 있는 부동산 정보를 확인하세요',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover',
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
        <Suspense fallback={null}>
          <ConfigProvider>
            <QueryClientProvider>
              <FirebaseInitializer />
              <Toaster />
              {children}
            </QueryClientProvider>
          </ConfigProvider>
        </Suspense>
      </body>
    </html>
  );
}

import { Header } from '@/wigets/ui/Header';

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Toaster } from '@package/ui';

import '../../../../packages/styles/globals.css';
import { QueryClientProvider } from './components/QueryClientProvider';
import { WebviewProvider } from './components/WebviewProvider';

export const metadata: Metadata = {
  icons: {
    icon: '/assets/favicon.ico',
  },
  title: '집사요 - 실거래가 기반 부동산 정보 플랫폼',
  description:
    '실시간 실거래가 데이터로 신뢰할 수 있는 부동산 정보를 확인하세요',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">
        <Suspense fallback={null}>
          <WebviewProvider>
            <QueryClientProvider>
              <div className="flex min-h-dvh flex-col items-center">
                <Header />
                <main className="w-full max-w-[640px] flex-1">
                  <section className="container mx-auto p-3 pb-10">
                    {children}
                  </section>
                </main>
              </div>
              <Toaster />
            </QueryClientProvider>
          </WebviewProvider>
        </Suspense>
      </body>
    </html>
  );
}

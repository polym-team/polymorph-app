import { Header } from '@/wigets/ui/Header';

import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';

import { Toaster } from '@package/ui';

import '../../../../packages/styles/globals.css';
import { QueryClientProvider } from './components/QueryClientProvider';

const notoSansKr = Noto_Sans_KR({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
});

export const metadata: Metadata = {
  title: '집사요 - 실거래가 기반 부동산 정보 플랫폼',
  description:
    '실시간 실거래가 데이터로 신뢰할 수 있는 부동산 정보를 확인하세요',
  viewport: {
    width: 'device-width',
    initialScale: 1,
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
      <body className={`${notoSansKr.variable} ${notoSansKr.className}`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 bg-gray-50">
            <QueryClientProvider>
              <section className="container mx-auto px-4 pb-10 pt-5">
                {children}
              </section>
            </QueryClientProvider>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

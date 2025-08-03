import { Header } from '@/wigets/ui/Header';

import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import Script from 'next/script';

import { Toaster } from '@package/ui';

import '../../../../packages/styles/globals.css';
import { DeviceIdInitializer } from './DeviceIdInitializer';
import { Providers } from './providers';
import { FirebaseInitializer } from './FirebaseInitializer';

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
      <head>
        {/* 개발 환경에서만 window.jibsayo.deviceId 주입 */}
        {process.env.NODE_ENV === 'development' && (
          <Script
            id="dev-device-id"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.jibsayo = window.jibsayo || {};
                window.jibsayo.deviceId = '';
                console.log('개발 환경: window.jibsayo.deviceId 주입됨:', window.jibsayo.deviceId);
              `,
            }}
          />
        )}
      </head>
      <body className={`${notoSansKr.variable} ${notoSansKr.className}`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 bg-gray-50">
            <Providers>
              <FirebaseInitializer />
              <DeviceIdInitializer />
              <section className="container mx-auto px-4 pb-10 pt-5">
                {children}
              </section>
            </Providers>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

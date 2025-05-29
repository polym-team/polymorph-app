import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';

import '../../../../packages/styles/globals.css';
import { Header } from '../components/Header';

const notoSansKr = Noto_Sans_KR({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
});

export const metadata: Metadata = {
  title: '집사요 - 당신의 집사를 찾아드립니다',
  description: '집사요에서 신뢰할 수 있는 집사 서비스를 만나보세요',
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
          <main className="flex-1 bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  );
}

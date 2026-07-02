import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { TopBar } from '@/components/TopBar';
import { SearchOverlay } from '@/components/SearchOverlay';
import { CartDrawer } from '@/components/CartDrawer';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'ROOTBEER MALL',
  description: '임직원 할인 공동구매',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="bg-paper text-ink-900 min-h-screen overflow-x-hidden font-sans antialiased">
        <AuthProvider>
          <TopBar />
          <main className="max-w-5xl mx-auto px-4 pt-4 pb-20">{children}</main>
          <SearchOverlay />
          <CartDrawer />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Nanum_Myeongjo } from 'next/font/google';
import './globals.css';
import { Toaster } from '@package/ui';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProviders } from '@/components/ThemeProviders';
import { TopBar } from '@/components/TopBar';
import { SearchOverlay } from '@/components/SearchOverlay';
import { CartDrawer } from '@/components/CartDrawer';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

// 에디토리얼 디스플레이 세리프 (한글 대응). CJK라 preload는 끈다.
const serif = Nanum_Myeongjo({
  weight: ['400', '700', '800'],
  variable: '--font-serif',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'ROOTBEER MALL',
  description: '임직원 할인 공동구매',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink-900 min-h-screen overflow-x-hidden font-sans antialiased">
        <ThemeProviders>
          <AuthProvider>
            <TopBar />
            <main className="max-w-5xl mx-auto px-4 pt-4 pb-20">{children}</main>
            <SearchOverlay />
            <CartDrawer />
          </AuthProvider>
          <Toaster />
        </ThemeProviders>
      </body>
    </html>
  );
}

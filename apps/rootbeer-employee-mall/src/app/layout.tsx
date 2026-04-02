import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { BottomNav } from '@/components/BottomNav';
import { ProductDetailModal } from '@/components/ProductDetailModal';

export const metadata: Metadata = {
  title: '임직원몰',
  description: '임직원 할인 공동구매',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen overflow-x-hidden">
        <AuthProvider>
          <main className="max-w-5xl mx-auto px-4 pt-4 pb-24">{children}</main>
          <BottomNav />
          <ProductDetailModal />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { ProductDetailModal } from '@/components/ProductDetailModal';

export const metadata: Metadata = {
  title: '임직원몰',
  description: '임직원 할인 공동구매',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
          <ProductDetailModal />
        </AuthProvider>
      </body>
    </html>
  );
}

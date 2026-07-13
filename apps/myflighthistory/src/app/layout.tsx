import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MyFlightHistory - 내 항공편 타임라인',
  description: '내 항공편을 등록해 과거·현재·미래(지연 예측)를 한눈에',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen" style={{ background: '#050506' }}>
        {children}
      </body>
    </html>
  );
}

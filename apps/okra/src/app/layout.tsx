import type { Metadata } from 'next';
import { Providers } from './components/Providers';

import '../../../../packages/styles/globals.css';

export const metadata: Metadata = {
  title: 'Okra - OKR 관리',
  description: '팀의 OKR을 함께 만들고, 실행하고, 회고하세요',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

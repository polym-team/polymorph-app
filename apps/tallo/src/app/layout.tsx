import type { Metadata } from 'next';

import '@package/theme/presets/tallo.css';
import '@package/styles/globals.css';

import { ThemeProviders } from './providers';

export const metadata: Metadata = {
  title: 'Tallo',
  description: '입금 원장 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProviders>{children}</ThemeProviders>
      </body>
    </html>
  );
}

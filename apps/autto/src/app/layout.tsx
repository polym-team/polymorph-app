import type { Metadata } from 'next';

import '@package/theme/presets/autto.css';
import '@package/styles/globals.css';

import { ThemeProviders } from './providers';

export const metadata: Metadata = {
  title: 'Autto - 동행복권 자동구매',
  description: '동행복권 로또 6/45 자동구매 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProviders>
          <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
        </ThemeProviders>
      </body>
    </html>
  );
}

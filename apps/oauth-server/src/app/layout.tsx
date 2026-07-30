import type { Metadata } from 'next';

import '@package/theme/presets/oauth-server.css';
import '@package/styles/globals.css';

import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import { ThemeProviders } from './providers';

export const metadata: Metadata = {
  title: 'Polymorph OAuth',
  description: 'Polymorph 통합 인증 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProviders>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </ThemeProviders>
      </body>
    </html>
  );
}

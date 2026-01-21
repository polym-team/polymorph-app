import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

import '../../../../packages/styles/globals.css';

export const metadata: Metadata = {
  title: 'Bookmark Share',
  description: 'Share bookmarks with your GitHub organization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

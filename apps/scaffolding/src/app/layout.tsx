import type { Metadata } from 'next';

import '../../../../packages/styles/globals.css';

export const metadata: Metadata = {
  title: 'Polymorph Scaffolding App',
  description: 'A scaffolding app for rapid prototyping',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';

import '../../../../packages/styles/globals.css';

export const metadata: Metadata = {
  title: 'Polymorph Scaffolding App',
  description: 'A scaffolding app for rapid prototyping',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover',
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

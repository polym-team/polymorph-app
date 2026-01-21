import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Polymorph - 기술로 비즈니스의 형태를 바꾸다',
  description:
    'LG, 아모레퍼시픽, 카카오, 배민 출신 시니어 개발자들이 만든 개발팀. 웹/앱 개발, 레거시 시스템 개선, 기술 컨설팅 서비스를 제공합니다.',
  keywords: [
    '웹개발',
    '앱개발',
    'React',
    'Vue',
    'Node.js',
    '기술컨설팅',
    '레거시시스템',
    '시스템최적화',
    '개발외주',
  ],
  authors: [{ name: 'Polymorph' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://polymorph.co.kr',
    siteName: 'Polymorph',
    title: 'Polymorph - 기술로 비즈니스의 형태를 바꾸다',
    description:
      'LG, 아모레퍼시픽, 카카오, 배민 출신 시니어 개발자들이 만든 개발팀',
    images: [
      {
        url: '/logo/logo_polymorph_mint.png',
        width: 512,
        height: 512,
        alt: 'Polymorph Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polymorph - 기술로 비즈니스의 형태를 바꾸다',
    description:
      'LG, 아모레퍼시픽, 카카오, 배민 출신 시니어 개발자들이 만든 개발팀',
    images: ['/logo/logo_polymorph_mint.png'],
  },
  icons: {
    icon: '/logo/logo_polymorph_mint.png',
    apple: '/logo/logo_polymorph_mint.png',
  },
  metadataBase: new URL('https://polymorph.co.kr'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

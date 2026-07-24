'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_EMAIL } from '@/types';
import { tabItemClass } from '@/components/ui';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') return <div className="text-center py-12 text-ink-600">로딩 중...</div>;

  if (!session || session.user.email !== ADMIN_EMAIL) {
    return (
      <div className="text-center py-12">
        <p className="text-terra-600">접근 권한이 없습니다.</p>
      </div>
    );
  }

  const tabs = [
    { href: '/admin/rounds', label: '주문 라운드' },
    { href: '/admin/deposits', label: '입금 정산' },
    { href: '/admin/users', label: '사용자 관리' },
    { href: '/admin/scrape', label: '상품 갱신' },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-5 border-b border-line">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className={tabItemClass(pathname.startsWith(tab.href))}>
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}

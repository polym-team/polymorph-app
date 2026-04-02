'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_EMAIL } from '@/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  if (!session || session.user.email !== ADMIN_EMAIL) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">접근 권한이 없습니다.</p>
      </div>
    );
  }

  const tabs = [
    { href: '/admin/rounds', label: '주문 라운드' },
    { href: '/admin/users', label: '사용자 관리' },
    { href: '/admin/scrape', label: '상품 갱신' },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              pathname.startsWith(tab.href)
                ? 'border-black text-black font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}

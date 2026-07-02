'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/format';

interface NoticeItem {
  id: number;
  externalId: number;
  title: string;
  noticeDate: string;
}

export default function NoticesPage() {
  const { data: session, status } = useSession();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role === 'pending') return;

    fetch('/api/notices')
      .then((r) => r.json())
      .then((data) => setNotices(data))
      .finally(() => setLoading(false));
  }, [status, session?.user?.role]);

  if (status === 'loading' || loading) {
    return <div className="text-center py-12 text-ink-600">로딩 중...</div>;
  }

  return (
    <div>
      <PageHeader title="공지사항" subtitle="임직원 공지" />

      {notices.length === 0 ? (
        <EmptyState title="공지사항이 없습니다" />
      ) : (
        <div className="space-y-1.5">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/notices/${notice.id}`}
              className="flex items-center gap-3 bg-paper-card rounded-lg border border-line px-4 py-3 shadow-soft hover:border-clay-500/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-900 truncate">{notice.title}</p>
              </div>
              <span className="text-[11px] text-ink-400 flex-shrink-0">
                {formatDate(notice.noticeDate)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

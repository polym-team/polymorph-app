'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    return <div className="text-center py-12 text-gray-500">로딩 중...</div>;
  }

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">임직원 공지사항</h1>

      {notices.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <p>공지사항이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/notices/${notice.id}`}
              className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-4 py-3 hover:border-accent-500/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{notice.title}</p>
              </div>
              <span className="text-[11px] text-gray-400 flex-shrink-0">
                {new Date(notice.noticeDate).toLocaleDateString('ko-KR')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

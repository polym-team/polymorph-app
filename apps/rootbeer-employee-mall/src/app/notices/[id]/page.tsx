'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

interface NoticeDetail {
  id: number;
  externalId: number;
  title: string;
  content: string | null;
  noticeDate: string;
}

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role === 'pending') return;

    fetch(`/api/notices/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('공지사항을 찾을 수 없습니다');
        return r.json();
      })
      .then((data) => setNotice(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, status, session?.user?.role]);

  if (status === 'loading' || loading) {
    return <div className="text-center py-12 text-ink-600">로딩 중...</div>;
  }

  if (error || !notice) {
    return (
      <div className="text-center py-12">
        <p className="text-terra-600 mb-4">{error || '공지사항을 찾을 수 없습니다'}</p>
        <Link href="/notices" className="text-sm text-clay-600 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          &larr; 뒤로가기
        </button>
        <Link href="/notices" className="text-sm text-ink-400 hover:text-ink-600 transition-colors">
          목록 보기
        </Link>
      </div>

      <div className="mt-3 mb-4">
        <h1 className="text-lg font-bold text-ink-900">{notice.title}</h1>
        <p className="text-xs text-ink-400 mt-1">{formatDate(notice.noticeDate)}</p>
      </div>

      {notice.content ? (
        <div
          className="bg-paper-card rounded-lg border border-line shadow-soft p-4 prose prose-sm max-w-none prose-headings:text-ink-900 prose-p:text-ink-600 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />
      ) : (
        <div className="bg-line-soft rounded-lg p-6 text-center text-sm text-ink-400">
          내용을 불러올 수 없습니다.
          <a
            href={`https://www.amoremall.com/kr/ko/cs/noticeView/${notice.externalId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-clay-600 hover:underline"
          >
            아모레몰에서 보기
          </a>
        </div>
      )}
    </div>
  );
}

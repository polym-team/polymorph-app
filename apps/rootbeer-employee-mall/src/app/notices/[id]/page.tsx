'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    return <div className="text-center py-12 text-gray-500">로딩 중...</div>;
  }

  if (error || !notice) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || '공지사항을 찾을 수 없습니다'}</p>
        <Link href="/notices" className="text-sm text-accent-500 hover:underline">
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
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          &larr; 뒤로가기
        </button>
        <Link href="/notices" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          목록 보기
        </Link>
      </div>

      <div className="mt-3 mb-4">
        <h1 className="text-lg font-bold text-gray-900">{notice.title}</h1>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(notice.noticeDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {notice.content ? (
        <div
          className="bg-white rounded-lg border border-gray-100 p-4 prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded"
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-sm text-gray-400">
          내용을 불러올 수 없습니다.
          <a
            href={`https://www.amoremall.com/kr/ko/cs/noticeView/${notice.externalId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-accent-500 hover:underline"
          >
            아모레몰에서 보기
          </a>
        </div>
      )}
    </div>
  );
}

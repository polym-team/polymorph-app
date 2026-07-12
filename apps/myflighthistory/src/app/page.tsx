'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Me {
  authenticated: boolean;
  user?: { id: string; email: string; name?: string };
}

export default function HomePage() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ authenticated: false }));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">MyFlightHistory</h1>
        <p className="text-sm text-gray-500">내 항공편을 한눈에 — 과거·현재·미래(지연 예측)</p>
      </header>

      {me === null ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : me.authenticated ? (
        <div className="rounded border bg-white p-4 text-sm">
          <p>
            <span className="font-medium">{me.user?.name ?? me.user?.email}</span> 님, 환영합니다.
          </p>
          <p className="mt-2 text-gray-500">항공편 연동 기능은 곧 추가됩니다.</p>
        </div>
      ) : (
        <div className="rounded border bg-white p-4 text-sm">
          <p className="mb-3 text-gray-600">시작하려면 로그인하세요.</p>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded bg-gray-900 px-4 text-white"
          >
            로그인
          </Link>
        </div>
      )}
    </div>
  );
}

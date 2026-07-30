'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, logout, refreshSession } from '@/components/AuthProvider';
import { MembershipGate } from '@/components/MembershipGate';

export default function MigratePage() {
  const { status, candidateEmail } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 연결됐거나 비로그인이면 홈으로 (AuthProvider가 신규는 /apply로 보냄)
  useEffect(() => {
    if (status === 'linked' || status === 'anonymous') router.replace('/');
  }, [status, router]);

  const onConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agree: true }),
      });
      if (res.ok) {
        await refreshSession();
        router.replace('/');
        return;
      }
      const d = await res.json().catch(() => ({}));
      setError(d.error || '연결에 실패했습니다.');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    }
    setSubmitting(false);
  };

  if (status !== 'needs_migrate') {
    return <div className="min-h-[80vh] flex items-center justify-center font-serif text-ink-400">잠시만요...</div>;
  }

  return (
    <MembershipGate
      mode="migrate"
      email={candidateEmail}
      submitting={submitting}
      error={error}
      onConfirm={onConfirm}
      onReject={() => logout()}
    />
  );
}

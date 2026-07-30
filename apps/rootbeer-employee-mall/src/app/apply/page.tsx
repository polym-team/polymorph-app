'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, logout, refreshSession } from '@/components/AuthProvider';
import { MembershipGate } from '@/components/MembershipGate';

export default function ApplyPage() {
  const { status, oauthEmail } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'linked' || status === 'anonymous') router.replace('/');
    if (status === 'needs_migrate') router.replace('/migrate');
  }, [status, router]);

  const onConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agree: true }),
      });
      if (res.ok) {
        await refreshSession();
        router.replace('/'); // 승인 대기(pending) 화면은 홈에서 처리
        return;
      }
      const d = await res.json().catch(() => ({}));
      if (d.redirect === '/migrate') {
        router.replace('/migrate');
        return;
      }
      setError(d.error || '가입 신청에 실패했습니다.');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    }
    setSubmitting(false);
  };

  if (status !== 'needs_apply') {
    return <div className="min-h-[80vh] flex items-center justify-center font-serif text-ink-400">잠시만요...</div>;
  }

  return (
    <MembershipGate
      mode="apply"
      email={oauthEmail}
      submitting={submitting}
      error={error}
      onConfirm={onConfirm}
      onReject={() => logout()}
    />
  );
}

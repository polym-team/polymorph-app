'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Account {
  id: string;
  provider: string;
  providerAccountId: string;
  createdAt: string;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  profileImage: string | null;
  accounts: Account[];
}

const PROVIDER_LABELS: Record<string, { name: string; color: string }> = {
  google: { name: 'Google', color: 'bg-white border-gray-300 text-gray-700' },
  kakao: { name: '카카오', color: 'bg-[#FEE500] text-[#191919]' },
};

export default function AccountPage() {
  const { status } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUser() {
    try {
      const res = await fetch('/api/account');
      if (!res.ok) {
        setUser(null);
        return;
      }
      setUser(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'authenticated') fetchUser();
    else if (status === 'unauthenticated') setLoading(false);

    // URL 에러 메시지
    const params = new URLSearchParams(window.location.search);
    const errCode = params.get('error');
    if (errCode === 'already_linked_to_other') {
      setError('해당 소셜 계정은 이미 다른 계정에 연결되어 있습니다. 병합을 원하시면 "계정 병합"을 이용해주세요.');
    } else if (errCode === 'invalid_linking_user') {
      setError('연동 세션이 만료되었습니다. 다시 시도해주세요.');
    } else if (errCode === 'invalid_merging_user') {
      setError('병합 세션이 만료되었습니다. 다시 시도해주세요.');
    }
  }, [status]);

  async function handleLink(provider: string) {
    try {
      // 1. 서버에 연동 쿠키 설정 요청
      const res = await fetch('/api/account/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '연동 준비 실패');
        return;
      }
      // 2. NextAuth signIn 실행 (CSRF 처리 자동)
      signIn(provider, { callbackUrl: '/account' });
    } catch {
      setError('네트워크 오류');
    }
  }

  async function handleMerge(provider: string) {
    const confirmed = confirm(
      `${PROVIDER_LABELS[provider]?.name} 계정으로 로그인한 기존 계정이 있다면, 그 계정의 연결이 현재 계정에 통합되고 기존 계정은 삭제됩니다.\n\n계속하시겠습니까?`,
    );
    if (!confirmed) return;
    try {
      const res = await fetch('/api/account/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '병합 준비 실패');
        return;
      }
      signIn(provider, { callbackUrl: '/account' });
    } catch {
      setError('네트워크 오류');
    }
  }

  async function handleUnlink(provider: string) {
    if (!confirm(`${PROVIDER_LABELS[provider]?.name} 연동을 해제하시겠습니까?`)) return;
    const res = await fetch('/api/account/unlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '연동 해제 실패');
      return;
    }
    fetchUser();
  }

  async function handleDelete() {
    const confirm1 = confirm(
      '정말 계정을 삭제하시겠습니까?\n\n연결된 모든 소셜 계정 정보가 삭제되며, 복구할 수 없습니다.',
    );
    if (!confirm1) return;
    const confirm2 = prompt('확인을 위해 "삭제"를 입력해주세요.');
    if (confirm2 !== '삭제') return;

    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || '계정 삭제 실패');
      return;
    }
    // 세션도 종료하고 테스트 페이지로 이동
    signOut({ callbackUrl: '/test' });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm text-gray-500">계정 관리는 로그인 후 사용할 수 있습니다.</p>
          <button
            onClick={() => signIn(undefined, { callbackUrl: '/account' })}
            className="mt-6 w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  const linkedProviders = new Set(user.accounts.map((a) => a.provider));
  const availableProviders = Object.keys(PROVIDER_LABELS).filter(
    (p) => !linkedProviders.has(p),
  );

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        {/* 프로필 */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {user.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImage}
                alt=""
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-500">
                {user.name?.[0] ?? '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-bold">{user.name ?? '이름 없음'}</div>
              <div className="truncate text-sm text-gray-500">{user.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/test' })}
              className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              닫기
            </button>
          </div>
        )}

        {/* 연결된 계정 */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold">연결된 소셜 계정</h2>
          <div className="space-y-2">
            {user.accounts.map((account) => {
              const label = PROVIDER_LABELS[account.provider]?.name ?? account.provider;
              const canUnlink = user.accounts.length > 1;
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-gray-400">
                      연결일: {new Date(account.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnlink(account.provider)}
                    disabled={!canUnlink}
                    className="rounded px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                    title={!canUnlink ? '최소 1개의 계정이 연결되어야 합니다.' : ''}
                  >
                    해제
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 추가 연동 */}
        {availableProviders.length > 0 && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold">소셜 계정 추가 연동</h2>
            <p className="mb-4 text-sm text-gray-500">
              다른 소셜 계정을 연결하면 어느 쪽으로 로그인해도 같은 계정으로 접근할 수 있습니다.
            </p>
            <div className="space-y-2">
              {availableProviders.map((provider) => {
                const label = PROVIDER_LABELS[provider];
                return (
                  <button
                    key={provider}
                    onClick={() => handleLink(provider)}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition hover:brightness-95 ${label.color}`}
                  >
                    {label.name} 연결하기
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 계정 병합 */}
        {availableProviders.length > 0 && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-base font-bold">다른 계정 병합</h2>
            <p className="mb-4 text-sm text-gray-500">
              같은 이메일을 공유하지 않는 다른 소셜 계정으로 이미 가입했다면, 이 기능으로 병합할 수 있습니다.
              <br />
              <span className="text-orange-600">⚠ 다른 계정은 삭제되고 현재 계정으로 통합됩니다.</span>
            </p>
            <div className="space-y-2">
              {availableProviders.map((provider) => {
                const label = PROVIDER_LABELS[provider];
                return (
                  <button
                    key={provider}
                    onClick={() => handleMerge(provider)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:border-gray-400"
                  >
                    {label.name} 계정 병합
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 위험 영역: 계정 삭제 */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="mb-2 text-base font-bold text-red-700">계정 삭제</h2>
          <p className="mb-4 text-sm text-red-600">
            계정을 삭제하면 연결된 모든 소셜 계정 정보가 사라집니다. 복구할 수 없습니다.
          </p>
          <button
            onClick={handleDelete}
            className="w-full rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600"
          >
            계정 삭제
          </button>
        </div>

      </div>
    </div>
  );
}

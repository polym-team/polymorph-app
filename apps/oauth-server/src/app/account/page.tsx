'use client';

import {
  Alert,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Separator,
} from '@package/ui';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Account {
  id: string;
  provider: string;
  providerAccountId: string;
  email: string | null;
  name: string | null;
  createdAt: string;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  profileImage: string | null;
  accounts: Account[];
}

const PROVIDER_LABELS: Record<string, { name: string }> = {
  google: { name: 'Google' },
  kakao: { name: '카카오' },
};

function ProviderMark({ provider }: { provider: string }) {
  if (provider === 'kakao') {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FEE500] text-[#191919]">
        <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 1C4.58 1 1 3.85 1 7.36c0 2.27 1.51 4.27 3.79 5.4l-.97 3.55c-.09.32.27.58.55.4l4.26-2.83c.12.01.24.01.37.01 4.42 0 8-2.85 8-6.36S13.42 1 9 1z"
            fill="#191919"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card">
      <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
      </svg>
    </span>
  );
}

export default function AccountPage() {
  const { status } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

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
      setError(
        '해당 소셜 계정은 이미 다른 계정에 연결되어 있습니다. 병합을 원하시면 "계정 병합"을 이용해주세요.'
      );
    } else if (errCode === 'invalid_linking_user') {
      setError('연동 세션이 만료되었습니다. 다시 시도해주세요.');
    } else if (errCode === 'invalid_merging_user') {
      setError('병합 세션이 만료되었습니다. 다시 시도해주세요.');
    }
  }, [status]);

  async function handleLink(provider: string) {
    try {
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
      signIn(provider, { callbackUrl: '/account' });
    } catch {
      setError('네트워크 오류');
    }
  }

  async function handleMerge(provider: string) {
    const confirmed = confirm(
      `${PROVIDER_LABELS[provider]?.name} 계정으로 로그인한 기존 계정이 있다면, 그 계정의 연결이 현재 계정에 통합되고 기존 계정은 삭제됩니다.\n\n계속하시겠습니까?`
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

  async function handleUnlink(accountId: string, provider: string) {
    if (!confirm(`${PROVIDER_LABELS[provider]?.name} 연동을 해제하시겠습니까?`)) return;
    const res = await fetch('/api/account/unlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '연동 해제 실패');
      return;
    }
    fetchUser();
  }

  async function confirmDelete() {
    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || '계정 삭제 실패');
      setDeleteOpen(false);
      return;
    }
    // 계정 삭제 후 세션 종료
    signOut({ callbackUrl: '/' });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          로딩 중…
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            계정 관리는 로그인 후 사용할 수 있습니다.
          </p>
          <Button
            variant="primary"
            className="mt-6 w-full"
            onClick={() => signIn(undefined, { callbackUrl: '/account' })}
          >
            로그인
          </Button>
        </div>
      </div>
    );
  }

  const availableProviders = Object.keys(PROVIDER_LABELS);

  return (
    <div className="min-h-screen px-4 py-8 sm:py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <h1 className="px-1 text-xl font-semibold tracking-tight">계정 관리</h1>

        {/* 프로필 */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              {user.profileImage ? <AvatarImage src={user.profileImage} alt="" /> : null}
              <AvatarFallback className="text-lg font-bold">
                {user.name?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{user.name ?? '이름 없음'}</div>
              <div className="truncate text-sm text-muted-foreground">{user.email}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
              로그아웃
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="shrink-0 underline">
              닫기
            </button>
          </Alert>
        )}

        {/* 연결된 계정 */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">연결된 소셜 계정</h2>
          <div className="flex flex-col gap-2">
            {user.accounts.map((account) => {
              const label = PROVIDER_LABELS[account.provider]?.name ?? account.provider;
              const canUnlink = user.accounts.length > 1;
              const identifier = account.email ?? account.name ?? '이메일 정보 없음';
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ProviderMark provider={account.provider} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{label}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {identifier}
                      </div>
                    </div>
                  </div>
                  {canUnlink ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlink(account.id, account.provider)}
                    >
                      해제
                    </Button>
                  ) : (
                    <Badge variant="outline" className="shrink-0 gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      기본
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          <Separator className="my-5" />

          <div className="text-sm font-semibold">계정 추가</div>
          <p className="mb-3 mt-1 text-xs text-muted-foreground">
            다른 소셜 계정을 연결하면 어느 쪽으로 로그인해도 같은 계정으로 접근할 수 있어요.
          </p>
          <div className="flex flex-wrap gap-2">
            {availableProviders.map((provider) => (
              <Button
                key={provider}
                variant="outline"
                size="sm"
                onClick={() => handleLink(provider)}
              >
                ＋ {PROVIDER_LABELS[provider].name} 연결
              </Button>
            ))}
            {availableProviders.map((provider) => (
              <Button
                key={`m-${provider}`}
                variant="outline"
                size="sm"
                onClick={() => handleMerge(provider)}
              >
                {PROVIDER_LABELS[provider].name} 계정 병합
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            병합은 다른 계정을 현재 계정으로 통합합니다.{' '}
            <span className="text-warning-foreground">⚠ 병합된 계정은 삭제됩니다.</span>
          </p>
        </div>

        {/* 위험 영역 */}
        <div className="rounded-2xl border border-danger/35 bg-danger/5 p-6 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-danger">계정 삭제</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            삭제하면 연결된 모든 소셜 계정과 데이터가 사라지며 되돌릴 수 없습니다.
          </p>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            계정 삭제
          </Button>
        </div>
      </div>

      {/* 삭제 확인 Dialog (네이티브 confirm/prompt 대체) */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setConfirmText('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정을 삭제할까요?</DialogTitle>
            <DialogDescription>
              연결된 모든 소셜 계정 정보가 삭제되며 복구할 수 없습니다. 확인을 위해{' '}
              <b className="font-semibold text-foreground">삭제</b>를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="삭제"
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button
              variant="danger"
              disabled={confirmText !== '삭제'}
              onClick={confirmDelete}
            >
              계정 삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

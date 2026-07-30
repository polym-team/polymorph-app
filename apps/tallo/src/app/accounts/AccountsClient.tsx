'use client';

import {
  Alert,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@package/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AccountItem {
  id: number;
  bank: string;
  accountNumber: string;
  label: string | null;
  confirmedAt: string | null; // 첫 은행 SMS 유입 시 자동 세팅
}

const BANKS = ['woori'];

export function AccountsClient({
  userName,
  accounts,
}: {
  userName: string;
  accounts: AccountItem[];
}) {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bank, setBank] = useState('woori');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function addAccount() {
    if (!accountNumber.trim()) {
      setError('계좌번호를 입력하세요.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bank, accountNumber, label: label || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? '실패');
      setLabel('');
      setAccountNumber('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(a: AccountItem) {
    setEditing(a.id);
    setEditLabel(a.label ?? '');
    setEditNumber(a.accountNumber);
  }

  async function saveEdit(id: number) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ label: editLabel, accountNumber: editNumber }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? '실패');
      setEditing(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      setDeletingId(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{userName}</span>
        <a href="/api/auth/logout" className="underline">
          로그아웃
        </a>
      </div>

      <h1 className="text-xl font-semibold tracking-tight">내 계좌</h1>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">
        입금 감시할 계좌를 등록하고, 그 계좌로 <b className="font-medium text-foreground">은행
        입금알림 서비스</b>를 직접 신청하세요. 첫 문자를 받으면 상태가{' '}
        <b className="font-medium text-foreground">자동으로 “확인됨”</b>이 됩니다.
      </p>

      {error && (
        <Alert variant="danger" className="mb-4">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 underline">
            닫기
          </button>
        </Alert>
      )}

      <div className="flex flex-col gap-2.5">
        {accounts.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            아직 등록된 계좌가 없습니다.
          </div>
        )}

        {accounts.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            {editing === a.id ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="라벨"
                  className="sm:flex-1"
                />
                <Input
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  placeholder="계좌번호"
                  className="font-mono sm:flex-1"
                />
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy} onClick={() => saveEdit(a.id)}>
                    저장
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setEditing(null)}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{a.label ?? `계좌 #${a.id}`}</span>
                    {a.confirmedAt ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
                        ● 확인됨 · {new Date(a.confirmedAt).toLocaleDateString('ko-KR')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        ○ 문자 대기 중
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-[13px] text-muted-foreground">
                    {a.bank} · {a.accountNumber}
                  </div>
                </div>
                <div className="flex flex-none gap-1.5">
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => startEdit(a)}>
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setDeletingId(a.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 계좌 추가 */}
      <div className="mt-6 rounded-xl border border-dashed border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">계좌 추가</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="h-10 rounded border border-input bg-background px-3 text-sm"
          >
            {BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <Input
            placeholder="계좌번호 (예: 1002-854-981268)"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="min-w-[180px] flex-1 font-mono"
          />
          <Input
            placeholder="라벨 (예: 공동구매 수취)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="min-w-[160px] flex-1"
          />
          <Button disabled={busy} onClick={addAccount}>
            ＋ 추가
          </Button>
        </div>
      </div>

      {/* 삭제 확인 */}
      <Dialog
        open={deletingId !== null}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이 계좌를 삭제할까요?</DialogTitle>
            <DialogDescription>
              감시 계좌가 삭제됩니다. 이미 적재된 입금 원장은 유지됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button
              variant="danger"
              disabled={busy}
              onClick={() => deletingId !== null && remove(deletingId)}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

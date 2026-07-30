'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@package/ui';
import { AccountCard } from './AccountCard';
import { AddAccountForm } from './AddAccountForm';
import { PurchaseHistory } from './PurchaseHistory';
import { Guide } from './Guide';

interface Preset {
  id: number;
  slot: string;
  mode: string;
  numbers: string | null;
}

export interface DhAccount {
  id: number;
  dhlotteryId: string;
  nickname: string | null;
  autoEnabled: boolean;
  presets: Preset[];
}

interface MeUser {
  id: string;
  email: string;
  name?: string;
}

const OAUTH_SERVER_URL =
  process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';

export function Dashboard() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [accounts, setAccounts] = useState<DhAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
        if (data.length > 0 && !selectedAccountId) {
          setSelectedAccountId(data[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) setUser(d.user);
      })
      .catch(() => {});
    fetchAccounts();
  }, [fetchAccounts]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    const returnTo = encodeURIComponent(window.location.origin);
    window.location.href = `${OAUTH_SERVER_URL}/api/logout?returnTo=${returnTo}`;
  };

  if (loading) {
    return <div className="text-center text-muted-foreground py-20">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9z" />
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Autto</h1>
            <p className="text-sm text-muted-foreground">{user?.name ?? user?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>

      {/* 계정 카드 목록 */}
      {accounts.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <p className="mb-4 text-muted-foreground">등록된 동행복권 계정이 없습니다.</p>
          <Button variant="primary" onClick={() => setShowAddForm(true)}>
            계정 추가
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                isSelected={selectedAccountId === account.id}
                onSelect={() => setSelectedAccountId(account.id)}
                onUpdate={fetchAccounts}
              />
            ))}
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full rounded-xl border-2 border-dashed border-border py-3 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              + 계정 추가
            </button>
          )}
        </>
      )}

      {/* 계정 추가 폼 */}
      {showAddForm && (
        <AddAccountForm
          onClose={() => setShowAddForm(false)}
          onAdded={() => {
            setShowAddForm(false);
            fetchAccounts();
          }}
        />
      )}

      {/* 이용 안내 */}
      <Guide />

      {/* 구매내역 */}
      {selectedAccountId && (
        <PurchaseHistory
          accountId={selectedAccountId}
          accountName={accounts.find((a) => a.id === selectedAccountId)?.nickname
            || accounts.find((a) => a.id === selectedAccountId)?.dhlotteryId
            || ''}
        />
      )}
    </div>
  );
}

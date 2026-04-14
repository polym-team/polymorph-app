'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { AccountCard } from './AccountCard';
import { AddAccountForm } from './AddAccountForm';
import { PurchaseHistory } from './PurchaseHistory';

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

export function Dashboard() {
  const { data: session } = useSession();
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
    fetchAccounts();
  }, [fetchAccounts]);

  if (loading) {
    return <div className="text-center text-gray-400 py-20">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Autto</h1>
          <p className="text-sm text-gray-500">{session?.user?.name}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
        >
          로그아웃
        </button>
      </div>

      {/* 계정 카드 목록 */}
      {accounts.length === 0 && !showAddForm ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="mb-4 text-gray-500">등록된 동행복권 계정이 없습니다.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-lotto-500 px-4 py-2 text-sm font-medium text-white hover:bg-lotto-600"
          >
            계정 추가
          </button>
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
              className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600"
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

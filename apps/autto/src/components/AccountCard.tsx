'use client';

import { useState } from 'react';
import type { DhAccount } from './Dashboard';
import { PresetEditor } from './PresetEditor';
import { BalanceInfo } from './BalanceInfo';

interface Props {
  account: DhAccount;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: () => void;
}

export function AccountCard({ account, isSelected, onSelect, onUpdate }: Props) {
  const [buying, setBuying] = useState(false);
  const [buyResult, setBuyResult] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleBuy() {
    if (!confirm('이 계정으로 로또를 구매하시겠습니까?')) return;
    setBuying(true);
    setBuyResult(null);
    try {
      const res = await fetch('/api/lotto/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id }),
      });
      const data = await res.json();
      if (data.success) {
        const nums = data.slots
          ?.map((s: { slot: string; mode: string; numbers: string[] }) =>
            `${s.slot}: [${s.mode}] ${s.numbers.join(', ')}`,
          )
          .join('\n');
        setBuyResult(`${data.roundNo}회 구매 성공!\n${nums}`);
      } else {
        setBuyResult(`구매 실패: ${data.error || data.message}`);
      }
    } catch {
      setBuyResult('구매 중 오류가 발생했습니다.');
    } finally {
      setBuying(false);
    }
  }

  async function handleToggleAuto() {
    setToggling(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          autoEnabled: !account.autoEnabled,
        }),
      });
      onUpdate();
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`"${account.nickname || account.dhlotteryId}" 계정을 삭제하시겠습니까?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/settings?accountId=${account.id}`, { method: 'DELETE' });
      onUpdate();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className={`rounded-lg border bg-white shadow-sm transition ${
        isSelected ? 'border-lotto-500 ring-1 ring-lotto-500' : 'border-gray-200'
      }`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b px-4 py-3" onClick={onSelect}>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lotto-50 text-sm font-bold text-lotto-600">
            {(account.nickname || account.dhlotteryId)[0].toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{account.nickname || account.dhlotteryId}</div>
            <div className="text-xs text-gray-400">{account.dhlotteryId}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleAuto(); }}
            disabled={toggling}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              account.autoEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            자동구매 {account.autoEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            disabled={deleting}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="삭제"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 선택된 계정 상세 */}
      {isSelected && (
        <div className="space-y-4 p-4">
          {/* 예치금 현황 */}
          <BalanceInfo accountId={account.id} />

          {/* 번호 프리셋 */}
          <PresetEditor
            accountId={account.id}
            presets={account.presets}
            onUpdate={onUpdate}
          />

          {/* 구매 버튼 */}
          <button
            onClick={handleBuy}
            disabled={buying}
            className="w-full rounded-lg bg-lotto-500 py-3 font-medium text-white transition hover:bg-lotto-600 disabled:opacity-50"
          >
            {buying ? '구매 중...' : '수동 구매'}
          </button>

          {/* 구매 결과 */}
          {buyResult && (
            <pre className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 whitespace-pre-wrap">
              {buyResult}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

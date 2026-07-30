'use client';

import { useState, useCallback } from 'react';
import { Button, Avatar, AvatarFallback } from '@package/ui';
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
  const [presetEditing, setPresetEditing] = useState(false);
  const [presetsValid, setPresetsValid] = useState(true);

  const handleEditingChange = useCallback((editing: boolean) => {
    setPresetEditing(editing);
  }, []);

  const handleValidChange = useCallback((valid: boolean) => {
    setPresetsValid(valid);
  }, []);

  const canBuy = !buying && !presetEditing && presetsValid;

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
      className={`rounded-xl border bg-card shadow-sm transition ${
        isSelected ? 'border-primary ring-1 ring-ring' : 'border-border'
      }`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3" onClick={onSelect}>
        <div className="flex items-center gap-3 cursor-pointer">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="font-bold">
              {(account.nickname || account.dhlotteryId)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{account.nickname || account.dhlotteryId}</div>
            <div className="text-xs text-muted-foreground">{account.dhlotteryId}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleAuto(); }}
            disabled={toggling}
            className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
              account.autoEnabled
                ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            자동구매 {account.autoEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            disabled={deleting}
            className="rounded p-1 text-muted-foreground transition hover:bg-danger/10 hover:text-danger disabled:opacity-50"
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
            onEditingChange={handleEditingChange}
            onValidChange={handleValidChange}
          />

          {/* 구매 버튼 */}
          <Button
            variant="primary"
            onClick={handleBuy}
            disabled={!canBuy}
            className="w-full"
            title={
              presetEditing ? '번호 설정을 저장한 후 구매해주세요' :
              !presetsValid ? '모든 수동 번호를 올바르게 입력해주세요' : ''
            }
          >
            {buying ? '구매 중...' : presetEditing ? '번호 설정 저장 후 구매 가능' : '수동 구매'}
          </Button>

          {/* 구매 결과 */}
          {buyResult && (
            <pre className="rounded-lg bg-muted/40 p-3 text-xs text-foreground whitespace-pre-wrap">
              {buyResult}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

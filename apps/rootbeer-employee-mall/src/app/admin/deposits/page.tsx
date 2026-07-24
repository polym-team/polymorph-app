'use client';

import { useEffect, useState } from 'react';
import { PageHeader, SectionCard, Button } from '@/components/ui';

type Confidence = 'high' | 'review' | 'ambiguous' | 'unmatched';

interface Proposal {
  deposit: { externalId: string; payerName: string; amount: number; txAt: string };
  order: { orderId: number; roundId: number; userId: number; userName: string; total: number } | null;
  confidence: Confidence;
  reason: string;
}

const LABEL: Record<Confidence, string> = {
  high: '자동정산 대상',
  review: '검토 필요(이름 불일치)',
  ambiguous: '모호(금액 중복)',
  unmatched: '미매칭 입금',
};

const won = (n: number) => n.toLocaleString('ko-KR') + '원';

export default function AdminDepositsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = () => {
    setLoading(true);
    setError(null);
    fetch('/api/admin/deposit-matches')
      .then((r) => r.json())
      .then((data) => {
        setProposals(data.proposals ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError('제안을 불러오지 못했습니다.');
        setLoading(false);
      });
  };

  useEffect(fetchProposals, []);

  const confirm = async (orderId: number, externalId: string) => {
    setBusy(externalId);
    setError(null);
    try {
      const res = await fetch('/api/admin/deposit-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, externalId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? '정산 처리에 실패했습니다.');
      } else {
        fetchProposals();
      }
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="text-center py-12 text-ink-600">불러오는 중...</div>;

  const groups: Confidence[] = ['high', 'review', 'ambiguous', 'unmatched'];
  const byConf = (c: Confidence) => proposals.filter((p) => p.confidence === c);

  return (
    <div>
      <PageHeader
        title="입금 정산"
        subtitle="Tallo 원장 입금과 미정산 주문 매칭 제안. 크론이 자동정산 대상은 주기적으로 처리하며, 나머지는 여기서 확인·확정합니다."
        action={
          <Button variant="subtle" size="sm" onClick={fetchProposals}>
            새로고침
          </Button>
        }
      />

      {error && <p className="mb-3 text-sm text-terra-600">{error}</p>}

      {proposals.length === 0 && (
        <p className="text-sm text-ink-400">매칭할 입금/주문이 없습니다.</p>
      )}

      {groups.map((conf) => {
        const items = byConf(conf);
        if (items.length === 0) return null;
        return (
          <div key={conf} className="mb-6">
            <h2 className="text-sm font-medium text-ink-600 mb-2">
              {LABEL[conf]} <span className="text-ink-400">({items.length})</span>
            </h2>
            <SectionCard className="divide-y divide-line">
              {items.map((p) => (
                <div
                  key={p.deposit.externalId}
                  className="p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink-900">
                      {won(p.deposit.amount)} · 입금자 {p.deposit.payerName}
                    </div>
                    <div className="text-xs text-ink-400">
                      {new Date(p.deposit.txAt).toLocaleString('ko-KR')} · {p.reason}
                    </div>
                    {p.order && (
                      <div className="text-xs text-ink-600 mt-0.5">
                        → 주문 #{p.order.orderId} · {p.order.userName} · 기대 {won(p.order.total)}{' '}
                        (라운드 {p.order.roundId})
                      </div>
                    )}
                  </div>
                  {p.order && conf !== 'high' && (
                    <Button
                      size="sm"
                      disabled={busy === p.deposit.externalId}
                      onClick={() => confirm(p.order!.orderId, p.deposit.externalId)}
                    >
                      이 매칭으로 정산
                    </Button>
                  )}
                  {conf === 'high' && (
                    <span className="text-xs text-ink-400 whitespace-nowrap">크론 자동처리</span>
                  )}
                </div>
              ))}
            </SectionCard>
          </div>
        );
      })}
    </div>
  );
}

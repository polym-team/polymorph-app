'use client';

import { useEffect, useState } from 'react';
import { Button } from '@package/ui';
import { OKRCard } from './OKRCard';
import { OKRForm } from './OKRForm';

interface OKROwner {
  user: { id: string; name: string; avatarUrl: string | null };
}

interface OKR {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  owners: OKROwner[];
  _count: { objectives: number; ideas: number };
}

const STATUS_TABS = [
  { key: '', label: '전체' },
  { key: 'PLANNING', label: '목표수립' },
  { key: 'ACTIVE', label: '진행' },
  { key: 'REVIEW', label: '회고' },
  { key: 'ARCHIVED', label: '아카이빙' },
];

export function OKRSection({ spaceId }: { spaceId: string }) {
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchOKRs = async (status?: string) => {
    try {
      const url = status
        ? `/api/spaces/${spaceId}/okrs?status=${status}`
        : `/api/spaces/${spaceId}/okrs`;
      const res = await fetch(url);
      if (res.ok) {
        setOkrs(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchOKRs(activeTab || undefined);
  }, [activeTab, spaceId]);

  const handleFormClose = () => {
    setShowForm(false);
    fetchOKRs(activeTab || undefined);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">OKR</h2>
        {!showForm && (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            + 새 OKR
          </Button>
        )}
      </div>

      <div className="mt-3 flex gap-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mt-4">
          <OKRForm spaceId={spaceId} onCancel={() => setShowForm(false)} onCreated={handleFormClose} />
        </div>
      )}

      {isLoading ? (
        <p className="mt-6 text-center text-gray-500">로딩 중...</p>
      ) : okrs.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {okrs.map((okr) => (
            <OKRCard key={okr.id} spaceId={spaceId} {...okr} />
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="mt-8 text-center">
            <p className="text-gray-400">아직 OKR이 없습니다.</p>
            <p className="mt-1 text-sm text-gray-400">새 OKR을 만들어 목표를 관리하세요.</p>
          </div>
        )
      )}
    </div>
  );
}

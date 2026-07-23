'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AccountItem {
  id: number;
  bank: string;
  accountNumber: string;
  label: string | null;
  confirmedAt: string | null; // 첫 은행 SMS 유입 시 Phase 3에서 자동 세팅
}

const box: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 4,
  padding: '1rem',
  marginBottom: '0.75rem',
};
const btn: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  borderRadius: 4,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
  marginRight: '0.5rem',
};
const inputStyle: React.CSSProperties = {
  padding: '0.4rem',
  border: '1px solid #ccc',
  borderRadius: 4,
  marginRight: '0.5rem',
};

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
    if (!confirm('이 계좌를 삭제할까요?')) return;
    setBusy(true);
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 640, lineHeight: 1.6 }}>
      <p style={{ color: '#888' }}>
        {userName} · <a href="/api/auth/logout">로그아웃</a>
      </p>
      <h1>내 계좌</h1>
      <p style={{ color: '#888', fontSize: 14 }}>
        입금 감시할 계좌를 등록하고, 그 계좌로 <strong>은행 입금알림 서비스</strong>를 직접
        신청하세요. 앱이 이 계좌의 첫 문자를 받으면 상태가 <strong>자동으로 “확인됨”</strong>이 됩니다.
      </p>

      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {accounts.length === 0 && <p style={{ color: '#888' }}>아직 등록된 계좌가 없습니다.</p>}

      {accounts.map((a) => (
        <div key={a.id} style={box}>
          {editing === a.id ? (
            <div>
              <input
                style={inputStyle}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="라벨"
              />
              <input
                style={inputStyle}
                value={editNumber}
                onChange={(e) => setEditNumber(e.target.value)}
                placeholder="계좌번호"
              />
              <div style={{ marginTop: '0.5rem' }}>
                <button style={btn} disabled={busy} onClick={() => saveEdit(a.id)}>
                  저장
                </button>
                <button style={btn} disabled={busy} onClick={() => setEditing(null)}>
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 600 }}>
                {a.label ?? `계좌 #${a.id}`}{' '}
                <span style={{ fontWeight: 400, color: a.confirmedAt ? '#0a0' : '#c80' }}>
                  {a.confirmedAt
                    ? `● 확인됨 (${new Date(a.confirmedAt).toLocaleDateString()})`
                    : '○ 문자 대기 중'}
                </span>
              </div>
              <div style={{ color: '#666', fontSize: 14 }}>
                {a.bank} · {a.accountNumber}
              </div>
              <div style={{ marginTop: '0.6rem' }}>
                <button style={btn} disabled={busy} onClick={() => startEdit(a)}>
                  수정
                </button>
                <button style={btn} disabled={busy} onClick={() => remove(a.id)}>
                  삭제
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <h2 style={{ marginTop: '2rem', fontSize: 16 }}>계좌 추가</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: 4 }}
        >
          {BANKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          placeholder="계좌번호(예: 1002-854-981268)"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <input
          placeholder="라벨(예: 공동구매 수취)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button style={btn} disabled={busy} onClick={addAccount}>
          추가
        </button>
      </div>
    </main>
  );
}

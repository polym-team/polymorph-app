'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeviceItem {
  id: number;
  name: string | null;
  phoneNumber: string | null;
  platform: string;
  confirmedAt: string | null; // 은행 입금알림 등록 자동 확인 시각(첫 SMS 유입 시 Phase 3에서 세팅)
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

export function DevicesClient({
  userName,
  devices,
}: {
  userName: string;
  devices: DeviceItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  async function addDevice() {
    if (!phone.trim()) {
      setError('전화번호를 입력하세요.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, phoneNumber: phone }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? '실패');
      setName('');
      setPhone('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(d: DeviceItem) {
    setEditing(d.id);
    setEditName(d.name ?? '');
    setEditPhone(d.phoneNumber ?? '');
  }

  async function saveEdit(id: number) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/devices/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: editName, phoneNumber: editPhone }),
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
    if (!confirm('이 디바이스를 삭제할까요?')) return;
    setBusy(true);
    try {
      await fetch(`/api/devices/${id}`, { method: 'DELETE' });
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
      <h1>내 디바이스</h1>
      <p style={{ color: '#888', fontSize: 14 }}>
        기기를 추가하고, 그 번호로 <strong>은행 입금알림 서비스</strong>를 직접 신청하세요. 앱이
        첫 은행 문자를 받으면 아래 상태가 <strong>자동으로 “확인됨”</strong>으로 바뀝니다.
      </p>

      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {devices.length === 0 && <p style={{ color: '#888' }}>아직 등록된 디바이스가 없습니다.</p>}

      {devices.map((d) => (
        <div key={d.id} style={box}>
          {editing === d.id ? (
            <div>
              <input
                style={inputStyle}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="라벨"
              />
              <input
                style={inputStyle}
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="전화번호"
              />
              <div style={{ marginTop: '0.5rem' }}>
                <button style={btn} disabled={busy} onClick={() => saveEdit(d.id)}>
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
                {d.name ?? `디바이스 #${d.id}`}{' '}
                <span style={{ fontWeight: 400, color: d.confirmedAt ? '#0a0' : '#c80' }}>
                  {d.confirmedAt
                    ? `● 확인됨 (${new Date(d.confirmedAt).toLocaleDateString()})`
                    : '○ 문자 대기 중'}
                </span>
              </div>
              <div style={{ color: '#666', fontSize: 14 }}>
                {d.phoneNumber ?? '번호 없음'} · {d.platform}
              </div>
              <div style={{ marginTop: '0.6rem' }}>
                <button style={btn} disabled={busy} onClick={() => startEdit(d)}>
                  수정
                </button>
                <button style={btn} disabled={busy} onClick={() => remove(d.id)}>
                  삭제
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <h2 style={{ marginTop: '2rem', fontSize: 16 }}>디바이스 추가</h2>
      <p style={{ color: '#888', fontSize: 13 }}>전화번호는 직접 입력하세요(자동조회 미지원).</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="라벨(예: 매장 공기계)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <input
          placeholder="전화번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button style={btn} disabled={busy} onClick={addDevice}>
          추가
        </button>
      </div>
    </main>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeviceItem {
  id: number;
  name: string | null;
  phoneNumber: string | null;
  platform: string;
  registered: boolean;
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

  async function enroll() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, phoneNumber: phone || undefined }),
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

  async function startRegistration(deviceId: number) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ deviceId, bank: 'woori' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? '실패');
      router.push(`/registrations/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류');
      setBusy(false);
    }
  }

  async function remove(deviceId: number) {
    if (!confirm('이 디바이스를 삭제할까요? 발급된 토큰도 폐기됩니다.')) return;
    setBusy(true);
    try {
      await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' });
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

      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {devices.length === 0 && <p style={{ color: '#888' }}>아직 등록된 디바이스가 없습니다.</p>}

      {devices.map((d) => (
        <div key={d.id} style={box}>
          <div style={{ fontWeight: 600 }}>
            {d.name ?? `디바이스 #${d.id}`}{' '}
            <span style={{ fontWeight: 400, color: d.registered ? '#0a0' : '#c80' }}>
              {d.registered ? '● 등록됨' : '○ 미등록'}
            </span>
          </div>
          <div style={{ color: '#666', fontSize: 14 }}>
            {d.phoneNumber ?? '번호 없음'} · {d.platform}
          </div>
          <div style={{ marginTop: '0.6rem' }}>
            <button
              style={btn}
              disabled={busy || !d.phoneNumber}
              onClick={() => startRegistration(d.id)}
            >
              은행 입금알림 등록 시작
            </button>
            <button style={btn} disabled={busy} onClick={() => remove(d.id)}>
              삭제
            </button>
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: '2rem', fontSize: 16 }}>디바이스 추가(수동)</h2>
      <p style={{ color: '#888', fontSize: 13 }}>
        보통은 폰의 브릿지 앱이 자동 엔롤합니다. 테스트/운영용 수동 추가.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
        <button style={btn} disabled={busy} onClick={enroll}>
          추가
        </button>
      </div>
    </main>
  );
}

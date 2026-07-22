'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  id: number;
  bank: string;
  phoneNumber: string;
  expiresAt: string;
}

interface SessionState {
  status: string;
  otpCode: string | null;
  expiresAt: string;
  active: boolean;
}

const btn: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: 4,
  border: '1px solid #ccc',
  background: '#fff',
  cursor: 'pointer',
  marginRight: '0.5rem',
};

function remaining(iso: string): number {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}

export function RegistrationClient({ id, bank, phoneNumber, expiresAt }: Props) {
  const [state, setState] = useState<SessionState>({
    status: 'awaiting_otp',
    otpCode: null,
    expiresAt,
    active: true,
  });
  const [secs, setSecs] = useState(() => remaining(expiresAt));
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/registrations/${id}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as SessionState;
      setState(data);
      setSecs(remaining(data.expiresAt));
      if (!data.active && pollRef.current) clearInterval(pollRef.current);
    } catch {
      /* 폴링 실패는 조용히 무시(다음 틱 재시도) */
    }
  }, [id]);

  useEffect(() => {
    if (issuedToken) return; // 완료 후 폴링 중단
    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [poll, issuedToken]);

  async function complete() {
    setError(null);
    const res = await fetch(`/api/registrations/${id}/complete`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? '완료 실패');
      return;
    }
    setIssuedToken(data.ingestToken);
    if (pollRef.current) clearInterval(pollRef.current);
  }

  async function cancel() {
    await fetch(`/api/registrations/${id}/cancel`, { method: 'POST' });
    window.location.href = '/devices';
  }

  const wrap: React.CSSProperties = {
    fontFamily: 'sans-serif',
    padding: '2rem',
    maxWidth: 560,
    lineHeight: 1.6,
  };

  if (issuedToken) {
    return (
      <main style={wrap}>
        <h1>등록 완료 ✅</h1>
        <p>디바이스가 활성화되었습니다. 아래 <strong>ingest 토큰</strong>을 브릿지 앱에 입력하세요.</p>
        <p style={{ color: '#c00', fontSize: 13 }}>이 토큰은 지금 한 번만 표시됩니다.</p>
        <pre
          style={{
            background: '#f5f5f5',
            padding: '0.8rem',
            borderRadius: 4,
            overflowX: 'auto',
            fontSize: 13,
          }}
        >
          {issuedToken}
        </pre>
        <button style={btn} onClick={() => navigator.clipboard?.writeText(issuedToken)}>
          토큰 복사
        </button>
        <a style={{ ...btn, textDecoration: 'none', color: '#000' }} href="/devices">
          디바이스로
        </a>
      </main>
    );
  }

  const expired = state.status === 'expired' || (!state.active && state.status === 'awaiting_otp');

  return (
    <main style={wrap}>
      <h1>은행 입금알림 등록</h1>
      <p style={{ color: '#666' }}>은행: {bank}</p>

      <ol>
        <li>
          은행 입금알림(ARS/앱/웹) 등록 화면에서 아래 번호를 입력하세요:
          <div style={{ fontSize: 24, fontWeight: 700, margin: '0.5rem 0' }}>{phoneNumber}</div>
        </li>
        <li>은행이 이 번호로 보낸 인증번호를 브릿지 앱이 자동 캡처하면 아래에 표시됩니다.</li>
        <li>표시된 인증번호를 은행 화면에 입력해 등록을 마친 뒤 “완료”를 누르세요.</li>
      </ol>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: '1rem',
          margin: '1rem 0',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#888', fontSize: 13 }}>수신된 인증번호</div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 4, minHeight: 48 }}>
          {state.otpCode ?? '···'}
        </div>
        {state.otpCode && (
          <button style={btn} onClick={() => navigator.clipboard?.writeText(state.otpCode!)}>
            복사
          </button>
        )}
      </div>

      <p style={{ color: expired ? '#c00' : '#888' }}>
        {expired ? '세션 만료됨' : `남은 시간 ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}
      </p>

      {error && <p style={{ color: '#c00' }}>{error}</p>}

      <div style={{ marginTop: '1rem' }}>
        <button style={btn} onClick={complete} disabled={expired || !state.otpCode}>
          완료
        </button>
        <button style={btn} onClick={cancel}>
          취소
        </button>
      </div>
    </main>
  );
}

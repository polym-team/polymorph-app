'use client';

import { Alert, Button } from '@package/ui';
import { useEffect, useState } from 'react';

interface DecodedPayload {
  sub: string;
  email: string;
  name?: string;
  provider: string;
  clientId: string;
  iss: string;
  iat: number;
  exp: number;
}

function decodeJwt(token: string): DecodedPayload | null {
  try {
    const [, payloadB64] = token.split('.');
    const binary = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const utf8 = new TextDecoder().decode(bytes);
    return JSON.parse(utf8);
  } catch {
    return null;
  }
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleString('ko-KR');
}

export function CallbackClient() {
  const [token, setToken] = useState<string | null>(null);
  const [payload, setPayload] = useState<DecodedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meData, setMeData] = useState<unknown>(null);

  useEffect(() => {
    const fragment = window.location.hash.slice(1);
    const params = new URLSearchParams(fragment);
    const t = params.get('token');

    if (!t) {
      setError('URL fragment에 token이 없습니다.');
      return;
    }

    setToken(t);
    const decoded = decodeJwt(t);
    if (decoded) setPayload(decoded);

    // /api/me 호출
    fetch('/api/me')
      .then((r) => r.json())
      .then(setMeData)
      .catch(() => setMeData({ error: '조회 실패' }));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Alert variant="danger">{error}</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">✅ 로그인 성공</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            JWT가 발급되어 URL fragment로 전달되었습니다.
          </p>
        </div>

        {payload && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">JWT 페이로드</h2>
            <div className="flex flex-col gap-3 text-sm">
              <Row label="sub (User ID)" value={payload.sub} />
              <Row label="email" value={payload.email} />
              <Row label="name" value={payload.name ?? '-'} />
              <Row label="provider" value={payload.provider} />
              <Row label="clientId" value={payload.clientId} />
              <Row label="iss (발행자)" value={payload.iss} />
              <Row label="iat (발급)" value={formatDate(payload.iat)} />
              <Row label="exp (만료)" value={formatDate(payload.exp)} />
            </div>
          </div>
        )}

        {token && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Raw JWT</h2>
            <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-green-300">
              {token}
            </pre>
          </div>
        )}

        {meData != null && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">/api/me 응답</h2>
            <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs">
              {JSON.stringify(meData, null, 2)}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <a href="/test" className="block">
            <Button variant="outline" className="w-full">
              다시 테스트
            </Button>
          </a>
          <a href="/account" className="block">
            <Button variant="outline" className="w-full">
              계정 관리
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-b-0">
      <span className="flex-shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <code className="break-all text-right text-xs">{value}</code>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@package/ui';

interface Invitation {
  id: string;
  token: string;
  inviteeEmail: string | null;
  expiresAt: string;
  createdAt: string;
}

export function InvitationSection({ spaceId }: { spaceId: string }) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const fetchInvitations = async () => {
    const res = await fetch(`/api/spaces/${spaceId}/invitations`);
    if (res.ok) {
      setInvitations(await res.json());
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [spaceId]);

  const createInvitation = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/invitations`, { method: 'POST' });
      if (res.ok) {
        await fetchInvitations();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const sendEmailInvitation = async () => {
    if (!email.trim()) return;
    setIsSendingEmail(true);
    setEmailSent(false);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setEmail('');
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
        await fetchInvitations();
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">초대</h2>

      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소 입력"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendEmailInvitation();
              }
            }}
          />
          <Button
            onClick={sendEmailInvitation}
            disabled={isSendingEmail || !email.trim()}
          >
            {isSendingEmail ? '전송 중...' : emailSent ? '전송 완료!' : '이메일 초대'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={createInvitation} disabled={isCreating} variant="outline">
            {isCreating ? '생성 중...' : '+ 새 링크 만들기'}
          </Button>
        </div>
      </div>

      {invitations.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {invitations.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3">
              <div className="text-sm">
                {inv.inviteeEmail ? (
                  <p className="text-xs text-gray-700">{inv.inviteeEmail}</p>
                ) : (
                  <p className="font-mono text-xs text-gray-500">...{inv.token.slice(-8)}</p>
                )}
                <p className="mt-0.5 text-xs text-gray-400">
                  {inv.inviteeEmail ? '이메일 초대' : '링크 초대'} · 만료: {formatDate(inv.expiresAt)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => copyLink(inv.token)}
              >
                {copiedToken === inv.token ? '복사됨!' : '링크 복사'}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          활성 초대가 없습니다. 이메일로 초대하거나 링크를 만들어 팀원을 초대하세요.
        </p>
      )}
    </div>
  );
}

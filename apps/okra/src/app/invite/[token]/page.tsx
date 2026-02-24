'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@package/ui';

interface InvitationInfo {
  space: {
    id: string;
    name: string;
    description: string | null;
    iconEmoji: string | null;
    memberCount: number;
  };
  expiresAt: string;
  isAlreadyMember: boolean;
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await fetch(`/api/invitations/${token}`);
        if (res.status === 404) {
          setError('초대 링크를 찾을 수 없습니다.');
          return;
        }
        if (res.status === 410) {
          setError('만료되었거나 유효하지 않은 초대 링크입니다.');
          return;
        }
        if (!res.ok) {
          setError('초대 정보를 불러오는데 실패했습니다.');
          return;
        }
        const data: InvitationInfo = await res.json();
        if (data.isAlreadyMember) {
          router.replace(`/spaces/${data.space.id}`);
          return;
        }
        setInfo(data);
      } catch {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token, router]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const res = await fetch(`/api/invitations/${token}`, { method: 'POST' });
      if (!res.ok) {
        setError('참여에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      const data = await res.json();
      router.replace(`/spaces/${data.spaceId}`);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-xl">😕</p>
          <p className="mt-4 text-gray-600">{error}</p>
          <Button className="mt-6" variant="outline" onClick={() => router.push('/spaces')}>
            내 Space로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="text-5xl">{info.space.iconEmoji || '🎯'}</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{info.space.name}</h1>
          {info.space.description && (
            <p className="mt-2 text-gray-500">{info.space.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-400">
            현재 {info.space.memberCount}명의 멤버
          </p>
        </div>

        <div className="mt-8">
          <p className="text-center text-sm text-gray-600">
            이 Space에 초대되었습니다. 참여하시겠습니까?
          </p>
          <Button
            className="mt-4 w-full"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? '참여 중...' : '참여하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}

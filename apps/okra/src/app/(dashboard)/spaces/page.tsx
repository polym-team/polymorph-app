'use client';

import { useEffect, useState } from 'react';
import { Button } from '@package/ui';
import { SpaceCard } from './_components/SpaceCard';
import { SpaceForm } from './_components/SpaceForm';

interface Space {
  id: string;
  name: string;
  description: string | null;
  iconEmoji: string | null;
  memberCount: number;
  myRole: string;
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchSpaces = async () => {
    try {
      const res = await fetch('/api/spaces');
      if (res.ok) {
        setSpaces(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleFormClose = () => {
    setShowForm(false);
    fetchSpaces();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">내 Space</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ 새 Space 만들기</Button>
        )}
      </div>

      {showForm && (
        <div className="mt-6">
          <SpaceForm onCancel={handleFormClose} />
        </div>
      )}

      {spaces.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {spaces.map((space) => (
            <SpaceCard key={space.id} {...space} />
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="mt-16 text-center">
            <p className="text-xl text-gray-400">🎯</p>
            <p className="mt-4 text-gray-500">아직 참여 중인 Space가 없습니다.</p>
            <p className="mt-2 text-sm text-gray-400">
              새로운 Space를 만들거나 초대 링크를 통해 참여하세요.
            </p>
            <Button className="mt-6" onClick={() => setShowForm(true)}>
              첫 번째 Space 만들기
            </Button>
          </div>
        )
      )}
    </div>
  );
}

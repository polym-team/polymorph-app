'use client';

import { useQuery } from '@tanstack/react-query';
import type { LandingData } from './types';

export function useLandingData() {
  return useQuery<LandingData>({
    queryKey: ['landing'],
    queryFn: async () => {
      const res = await fetch('/api/landing');
      if (!res.ok) throw new Error('랜딩 데이터 조회 실패');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

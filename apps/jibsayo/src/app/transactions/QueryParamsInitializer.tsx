'use client';

import { ROUTE_PATH } from '@/shared/consts/route';
import { useQueryParamsManager } from '@/shared/hooks/useQueryParamsManager';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * 페이지 로드 시 세션 스토리지에서 쿼리 파라미터를 복원하는 컴포넌트
 * 한 번만 실행되어 중복 복원을 방지합니다.
 */
export function QueryParamsInitializer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { restoreQueryParamsFromStorage } = useQueryParamsManager();

  useEffect(() => {
    // 현재 URL에 필수 파라미터가 있으면 복원하지 않음
    const regionCode = searchParams.get('regionCode');
    const tradeDate = searchParams.get('tradeDate');

    if (regionCode && tradeDate) {
      return; // 이미 URL에 파라미터가 있음
    }

    // 세션 스토리지에서 복원 시도
    const savedParams = restoreQueryParamsFromStorage();

    if (savedParams && savedParams.regionCode && savedParams.tradeDate) {
      // 복원된 파라미터로 URL 업데이트
      const urlSearchParams = new URLSearchParams();

      Object.entries(savedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          urlSearchParams.set(key, value);
        }
      });

      const newUrl = `${ROUTE_PATH.TRANSACTIONS}?${urlSearchParams.toString()}`;
      router.replace(newUrl); // push 대신 replace 사용하여 히스토리 스택에 추가하지 않음
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}

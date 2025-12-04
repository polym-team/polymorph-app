'use client';

import { ROUTE_PATH } from '@/shared/consts/route';
import { closeWebview } from '@/shared/services/webview';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { toast } from '@package/ui';

export function Error() {
  const router = useRouter();
  const { isInApp } = useGlobalConfigStore();

  useEffect(() => {
    toast.error('아파트 정보를 불러오지 못했어요');

    if (isInApp) {
      closeWebview();
    } else {
      router.replace(ROUTE_PATH.TRANSACTION);
    }
  }, [isInApp, router]);

  return null;
}

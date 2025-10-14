'use client';

import { ROUTE_PATH } from '@/shared/consts/route';
import { useOnceEffect } from '@/shared/hooks';
import { setOnClickBottomTabHandler } from '@/shared/services/webviewService';

import { useRouter } from 'next/navigation';

export function Client() {
  const router = useRouter();

  useOnceEffect(true, () => {
    setOnClickBottomTabHandler(type => {
      switch (type) {
        case 'transaction':
          router.push(ROUTE_PATH.TRANSACTION);
          break;
        case 'saved-apart':
          router.push(ROUTE_PATH.APART);
          break;
      }
    });
  });

  return null;
}

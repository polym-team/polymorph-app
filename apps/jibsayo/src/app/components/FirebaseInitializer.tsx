'use client';

import { useOnceEffect } from '@/shared/hooks/useOnceEffect';
import { jibsayoFirebaseClient } from '@/shared/lib/firebase';

export function FirebaseInitializer() {
  useOnceEffect(true, () => {
    // Firebase Analytics 초기화 확인
    const analytics = jibsayoFirebaseClient.getAnalytics();

    if (analytics) {
      console.log(
        'Firebase Analytics가 성공적으로 초기화되었습니다:',
        analytics
      );
    } else {
      console.log('Firebase Analytics 초기화 실패 (서버 사이드 렌더링)');
    }
  });

  return null;
}

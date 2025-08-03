'use client';

import { useEffect } from 'react';
import { jibsayoFirebaseClient } from '@/lib/firebase';

export function FirebaseInitializer() {
  useEffect(() => {
    // Firebase Analytics 초기화 확인
    const analytics = jibsayoFirebaseClient.getAnalytics();
    if (analytics) {
      console.log('Firebase Analytics가 성공적으로 초기화되었습니다:', analytics);
    } else {
      console.log('Firebase Analytics 초기화 실패 (서버 사이드 렌더링)');
    }
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
} 
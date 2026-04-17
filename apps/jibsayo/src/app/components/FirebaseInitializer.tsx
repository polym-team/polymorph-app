'use client';

import { useEffect } from 'react';

export function FirebaseInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const init = () => {
      import('@/shared/lib/firebase').then(({ jibsayoFirebaseClient }) => {
        jibsayoFirebaseClient.getAnalytics();
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(init);
    } else {
      setTimeout(init, 3000);
    }
  }, []);

  return null;
}

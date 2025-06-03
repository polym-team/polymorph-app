import { useEffect, useState } from 'react';

/**
 * 클라이언트에서 컴포넌트가 마운트되었는지 확인하는 훅
 * SSR과 CSR의 hydration 불일치를 방지하기 위해 사용
 *
 * @returns {boolean} 클라이언트에서 마운트되었으면 true, 서버 렌더링 중이면 false
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

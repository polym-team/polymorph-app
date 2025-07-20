import { useEffect, useState } from 'react';

import { getDeviceType, isMobileDevice } from '../lib/device';

/**
 * 현재 디바이스의 타입을 감지하는 훅
 * SSR과 CSR의 hydration 불일치를 방지하기 위해 클라이언트에서만 동작
 *
 * @returns {object} 디바이스 타입 정보
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const updateDeviceType = () => {
      const type = getDeviceType();
      const mobile = isMobileDevice();

      setDeviceType(type);
      setIsMobile(mobile);
    };

    updateDeviceType();

    // 화면 크기 변경 시 재감지
    const handleResize = () => {
      updateDeviceType();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    deviceType,
    isMobile,
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isClient,
  };
}

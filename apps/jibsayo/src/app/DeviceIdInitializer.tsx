'use client';

import { getDeviceIdSync, setDeviceIdSync } from '@/shared/lib/device';

import { useEffect } from 'react';

export function DeviceIdInitializer() {
  useEffect(() => {
    initDeviceId();
  }, []);

  function initDeviceId() {
    if (typeof window !== 'undefined' && window.jibsayo?.deviceId) {
      const currentDeviceId = getDeviceIdSync();
      if (!currentDeviceId) {
        setDeviceIdSync(window.jibsayo.deviceId);
        console.log('디바이스 ID가 초기화되었습니다:', window.jibsayo.deviceId);
      }
    }
  }

  return null;
}

'use client';

import { useOnceEffect } from '@/shared/hooks';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';
import { debounce } from '@/shared/utils/debounce';

import { useCallback } from 'react';

export function ViewportResizer() {
  const { updateDeviceType } = useGlobalConfigStore();

  const debouncedUpdateDeviceType = useCallback(
    debounce(updateDeviceType, 200),
    [updateDeviceType]
  );

  useOnceEffect(true, () => {
    window.addEventListener('resize', debouncedUpdateDeviceType);

    return () => {
      window.removeEventListener('resize', debouncedUpdateDeviceType);
    };
  });

  return null;
}

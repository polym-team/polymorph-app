declare global {
  interface Window {
    jibsayo: {
      deviceId: string;
    };
  }
}

export const getDeviceId = (): string => {
  if (typeof process.env.NEXT_PUBLIC_TEST_DEVICE_ID === 'string') {
    return process.env.NEXT_PUBLIC_TEST_DEVICE_ID;
  }

  if (typeof window === 'undefined' || !window.jibsayo) {
    return '';
  }

  return window.jibsayo?.deviceId ?? '';
};

type BottomTabType = 'transaction' | 'saved-apart';

declare global {
  interface Window {
    jibsayo: {
      deviceId: string;
      onClickBottomTab: (type: BottomTabType) => void;
    };
  }
}

export const getDeviceId = () => {
  if (typeof process.env.NEXT_PUBLIC_TEST_DEVICE_ID === 'string') {
    return process.env.NEXT_PUBLIC_TEST_DEVICE_ID;
  }

  if (typeof window === 'undefined' || !window.jibsayo) {
    return '';
  }

  return window.jibsayo?.deviceId ?? '';
};

export const setOnClickBottomTabHandler = (
  callback: Window['jibsayo']['onClickBottomTab']
) => {
  if (typeof window === 'undefined' || !window.jibsayo) return;

  window.jibsayo.onClickBottomTab = callback;
};

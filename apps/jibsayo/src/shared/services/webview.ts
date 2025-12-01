declare global {
  interface Window {
    jibsayo?: {
      deviceId: string;
      openWebview: (url: string) => void;
      closeWebview: () => void;
      onWebviewWillAppear?: () => void;
    };
  }
}

const hasJibsayoInterface = (
  window: unknown
): window is Window & { jibsayo: NonNullable<Window['jibsayo']> } => {
  return (
    typeof window === 'object' &&
    window !== null &&
    'jibsayo' in window &&
    (window as any).jibsayo !== undefined
  );
};

export const getDeviceId = (): string => {
  if (typeof process.env.NEXT_PUBLIC_TEST_DEVICE_ID === 'string') {
    return process.env.NEXT_PUBLIC_TEST_DEVICE_ID;
  }

  if (!hasJibsayoInterface(window)) {
    return '';
  }

  return window.jibsayo.deviceId;
};

export const openWebview = (url: string): void => {
  if (!hasJibsayoInterface(window)) return;
  window.jibsayo.openWebview(url);
};

export const closeWebview = (): void => {
  if (!hasJibsayoInterface(window)) return;
  window.jibsayo.closeWebview();
};

export const setOnWebviewWillAppear = (callback: () => void) => {
  if (!hasJibsayoInterface(window)) return;
  window.jibsayo.onWebviewWillAppear = callback;
};

export const removeOnWebviewWillAppear = () => {
  if (!hasJibsayoInterface(window)) return;
  window.jibsayo.onWebviewWillAppear = undefined;
};

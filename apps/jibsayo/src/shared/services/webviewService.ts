type BottomTabType = 'transaction' | 'saved-apart';

export type TabName = 'index' | 'saved' | 'settings';

declare global {
  interface Window {
    jibsayo: {
      deviceId: string;
      onClickBottomTab: (type: BottomTabType) => void;
      switchTab?: (tabName: TabName) => void;
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

export const setOnClickBottomTabHandler = (
  callback: Window['jibsayo']['onClickBottomTab']
) => {
  if (typeof window === 'undefined' || !window.jibsayo) return;

  window.jibsayo.onClickBottomTab = callback;
};

/**
 * switchTab 인터페이스가 사용 가능한지 확인
 */
export const isSwitchTabAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof window.jibsayo?.switchTab === 'function';
};

/**
 * 탭 전환 인터페이스 호출
 * @param tabName - 전환할 탭 이름 ('index' | 'saved' | 'settings')
 * @returns 인터페이스가 존재하면 true, 없으면 false
 */
export const switchTab = (tabName: TabName): boolean => {
  if (!isSwitchTabAvailable()) {
    return false;
  }

  window.jibsayo.switchTab?.(tabName);
  return true;
};

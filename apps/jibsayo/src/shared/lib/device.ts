import { getItem, removeItem, setItem } from './indexedDB';

// 디바이스 ID 관련 타입 정의
declare global {
  interface Window {
    jibsayo: {
      deviceId?: string;
    };
  }
}

// 디바이스 ID 관리 클래스
class DeviceManager {
  private static instance: DeviceManager;
  private _deviceId: string | null = null;
  private _isInitialized = false;

  private constructor() {}

  static getInstance(): DeviceManager {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager();
    }
    return DeviceManager.instance;
  }

  // 디바이스 ID 가져오기 (우선순위: window > IndexedDB > sessionStorage)
  async getDeviceId(): Promise<string | null> {
    if (this._deviceId) {
      return this._deviceId;
    }

    // 1. window.jibsayo.deviceId에서 가져오기
    if (typeof window !== 'undefined' && window.jibsayo?.deviceId) {
      this._deviceId = window.jibsayo.deviceId;
      return this._deviceId;
    }

    // 2. IndexedDB에서 가져오기
    try {
      const storedDeviceId = await getItem<string>('JIBSAYO:DEVICE_ID');
      if (storedDeviceId) {
        this._deviceId = storedDeviceId;
        return this._deviceId;
      }
    } catch (error) {
      console.warn('IndexedDB 접근 실패:', error);
    }

    // 3. sessionStorage에서 가져오기 (fallback)
    try {
      const sessionDeviceId = sessionStorage.getItem('JIBSAYO:DEVICE_ID');
      if (sessionDeviceId) {
        this._deviceId = sessionDeviceId;
        return this._deviceId;
      }
    } catch (error) {
      console.warn('sessionStorage 접근 실패:', error);
    }

    return null;
  }

  // 동기 버전 (기존 코드와의 호환성을 위해)
  getDeviceIdSync(): string | null {
    if (this._deviceId) {
      return this._deviceId;
    }

    // 1. window.jibsayo.deviceId에서 가져오기
    if (typeof window !== 'undefined' && window.jibsayo?.deviceId) {
      this._deviceId = window.jibsayo.deviceId;
      return this._deviceId;
    }

    // 2. sessionStorage에서 가져오기 (fallback)
    try {
      const sessionDeviceId = sessionStorage.getItem('JIBSAYO:DEVICE_ID');
      if (sessionDeviceId) {
        this._deviceId = sessionDeviceId;
        return this._deviceId;
      }
    } catch (error) {
      console.warn('sessionStorage 접근 실패:', error);
    }

    return null;
  }

  // 디바이스 ID 설정하기
  async setDeviceId(deviceId: string): Promise<void> {
    this._deviceId = deviceId;

    // IndexedDB에 저장 (영구 저장)
    try {
      await setItem('JIBSAYO:DEVICE_ID', deviceId);
    } catch (error) {
      console.warn('IndexedDB 저장 실패:', error);
    }

    // window 객체에 설정 (이미 있다면 업데이트)
    if (typeof window !== 'undefined') {
      if (!window.jibsayo) {
        window.jibsayo = {} as any;
      }
      window.jibsayo.deviceId = deviceId;
    }
  }

  // 동기 버전 (기존 코드와의 호환성을 위해)
  setDeviceIdSync(deviceId: string): void {
    this._deviceId = deviceId;

    // sessionStorage에 저장 (fallback)
    try {
      sessionStorage.setItem('JIBSAYO:DEVICE_ID', deviceId);
    } catch (error) {
      console.warn('sessionStorage 저장 실패:', error);
    }

    // window 객체에 설정 (이미 있다면 업데이트)
    if (typeof window !== 'undefined') {
      if (!window.jibsayo) {
        window.jibsayo = {} as any;
      }
      window.jibsayo.deviceId = deviceId;
    }
  }

  // 디바이스 ID 초기화
  async clearDeviceId(): Promise<void> {
    this._deviceId = null;

    try {
      await removeItem('JIBSAYO:DEVICE_ID');
      sessionStorage.removeItem('JIBSAYO:DEVICE_ID');
    } catch (error) {
      console.warn('스토리지 정리 실패:', error);
    }

    if (typeof window !== 'undefined' && window.jibsayo) {
      delete window.jibsayo.deviceId;
    }
  }

  // 디바이스 ID 유효성 검사
  isValidDeviceId(deviceId: string): boolean {
    return Boolean(deviceId && deviceId.length > 0 && deviceId.length <= 100);
  }

  // 디바이스 ID 생성 (필요시)
  generateDeviceId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `device_${timestamp}_${random}`;
  }
}

// 싱글톤 인스턴스 export
export const deviceManager = DeviceManager.getInstance();

// 편의 함수들
export const getDeviceId = async (): Promise<string | null> =>
  deviceManager.getDeviceId();
export const getDeviceIdSync = (): string | null =>
  deviceManager.getDeviceIdSync();
export const setDeviceId = async (deviceId: string): Promise<void> =>
  deviceManager.setDeviceId(deviceId);
export const setDeviceIdSync = (deviceId: string): void =>
  deviceManager.setDeviceIdSync(deviceId);
export const clearDeviceId = async (): Promise<void> =>
  deviceManager.clearDeviceId();
export const isValidDeviceId = (deviceId: string): boolean =>
  deviceManager.isValidDeviceId(deviceId);
export const generateDeviceId = (): string => deviceManager.generateDeviceId();

// 디바이스 타입 감지 관련 함수들
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;

  if (width < 768) {
    return 'mobile';
  } else if (width >= 768 && width < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  // User Agent 기반 모바일 감지
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'mobile',
    'android',
    'iphone',
    'ipod',
    'blackberry',
    'windows phone',
    'opera mini',
    'iemobile',
  ];

  const isMobileUserAgent = mobileKeywords.some(keyword =>
    userAgent.includes(keyword)
  );

  // 화면 크기 기반 모바일 감지
  const isMobileScreen = window.innerWidth < 768;

  return isMobileUserAgent || isMobileScreen;
};

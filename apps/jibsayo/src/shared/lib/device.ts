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

  // 디바이스 ID 가져오기 (우선순위: window > localStorage > sessionStorage)
  async getDeviceId(): Promise<string | null> {
    if (this._deviceId) {
      return this._deviceId;
    }

    // 1. window.jibsayo.deviceId에서 가져오기
    if (typeof window !== 'undefined' && window.jibsayo?.deviceId) {
      this._deviceId = window.jibsayo.deviceId;
      return this._deviceId;
    }

    // 2. localStorage에서 가져오기
    try {
      const storedDeviceId = localStorage.getItem('JIBSAYO:DEVICE_ID');
      if (storedDeviceId) {
        this._deviceId = storedDeviceId;
        return this._deviceId;
      }
    } catch (error) {
      console.warn('localStorage 접근 실패:', error);
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

    // 2. localStorage에서 가져오기
    try {
      const storedDeviceId = localStorage.getItem('JIBSAYO:DEVICE_ID');
      if (storedDeviceId) {
        this._deviceId = storedDeviceId;
        return this._deviceId;
      }
    } catch (error) {
      console.warn('localStorage 접근 실패:', error);
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

  // 디바이스 ID 설정하기
  async setDeviceId(deviceId: string): Promise<void> {
    this._deviceId = deviceId;

    // localStorage에 저장 (영구 저장)
    try {
      localStorage.setItem('JIBSAYO:DEVICE_ID', deviceId);
    } catch (error) {
      console.warn('localStorage 저장 실패:', error);
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

    // localStorage에 저장
    try {
      localStorage.setItem('JIBSAYO:DEVICE_ID', deviceId);
    } catch (error) {
      console.warn('localStorage 저장 실패:', error);
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

    // localStorage에서 삭제
    try {
      localStorage.removeItem('JIBSAYO:DEVICE_ID');
    } catch (error) {
      console.warn('localStorage 삭제 실패:', error);
    }

    // sessionStorage에서 삭제
    try {
      sessionStorage.removeItem('JIBSAYO:DEVICE_ID');
    } catch (error) {
      console.warn('sessionStorage 삭제 실패:', error);
    }

    // window 객체에서 삭제
    if (typeof window !== 'undefined' && window.jibsayo) {
      delete window.jibsayo.deviceId;
    }
  }

  // 디바이스 ID 유효성 검사
  isValidDeviceId(deviceId: string): boolean {
    return Boolean(deviceId && deviceId.startsWith('device_'));
  }

  // 디바이스 ID 생성 (필요시)
  generateDeviceId(): string {
    return (
      'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    );
  }
}

// 싱글톤 인스턴스 export
const deviceManager = DeviceManager.getInstance();

// 비동기 함수들
export const getDeviceId = () => deviceManager.getDeviceId();
export const setDeviceId = (deviceId: string) =>
  deviceManager.setDeviceId(deviceId);
export const clearDeviceId = () => deviceManager.clearDeviceId();

// 동기 함수들 (기존 코드와의 호환성을 위해)
export const getDeviceIdSync = () => deviceManager.getDeviceIdSync();
export const setDeviceIdSync = (deviceId: string) =>
  deviceManager.setDeviceIdSync(deviceId);

// 디바이스 ID 생성 함수
export const generateDeviceId = (): string => {
  return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// 디바이스 ID 유효성 검사 함수
export const isValidDeviceId = (deviceId: string): boolean => {
  return Boolean(deviceId && deviceId.startsWith('device_'));
};

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

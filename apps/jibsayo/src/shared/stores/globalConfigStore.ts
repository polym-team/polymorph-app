import { create } from 'zustand';

interface GlobalConfigStore {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  updateDeviceType: () => void;
}

const VIEWPORT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};

const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') {
    return 'desktop';
  } else if (window.innerWidth < VIEWPORT_BREAKPOINTS.mobile) {
    return 'mobile';
  } else if (window.innerWidth < VIEWPORT_BREAKPOINTS.tablet) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

export const useGlobalConfigStore = create<GlobalConfigStore>(set => ({
  deviceType: getDeviceType(),
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  updateDeviceType: () => {
    const deviceType = getDeviceType();

    set({
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
    });
  },
}));

// localStorage 헬퍼 함수들
export const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('localStorage getItem 실패:', error);
    return null;
  }
};

export const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('localStorage setItem 실패:', error);
    throw error;
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('localStorage removeItem 실패:', error);
  }
};

export const clear = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.warn('localStorage clear 실패:', error);
  }
};

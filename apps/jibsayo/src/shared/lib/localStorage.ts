const isBrowser = typeof window !== 'undefined';

export const getItem = <T>(key: string): T | null => {
  if (!isBrowser) return null;

  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.warn(`localStorage getItem 에러 (${key}):`, error);
    return null;
  }
};

export const setItem = (key: string, value: any): void => {
  if (!isBrowser) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`localStorage setItem 에러 (${key}):`, error);
  }
};

export const removeItem = (key: string): void => {
  if (!isBrowser) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`localStorage removeItem 에러 (${key}):`, error);
  }
};

const isBrowser = typeof window !== 'undefined';

export const getItem = <T>(key: string): T | null => {
  if (!isBrowser) return null;

  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    return null;
  }
};

export const setItem = (key: string, value: any): void => {
  if (!isBrowser) return;

  localStorage.setItem(key, JSON.stringify(value));
};

export const removeItem = (key: string): void => {
  if (!isBrowser) return;

  localStorage.removeItem(key);
};

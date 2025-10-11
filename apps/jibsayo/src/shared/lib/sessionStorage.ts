export const getItem = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;

  try {
    const item = sessionStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
};

export const setItem = (key: string, value: any): void => {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(key, JSON.stringify(value));
};

export const removeItem = (key: string): void => {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(key);
};

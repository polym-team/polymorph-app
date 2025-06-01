export const getSearchParams = <
  T extends Record<string, any>,
>(): Partial<T> => {
  // SSR 환경에서는 빈 객체 반환
  if (typeof window === 'undefined') {
    return {};
  }

  const searchParams = new URLSearchParams(window.location.search);
  const result: Partial<T> = {};

  searchParams.forEach((value, key) => {
    (result as any)[key] = value;
  });

  return result;
};

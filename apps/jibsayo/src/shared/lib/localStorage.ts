// 기존 코드와의 호환성을 위한 localStorage 래퍼
// 실제로는 IndexedDB를 사용하지만 동일한 인터페이스를 제공합니다.
import {
  getItem as getIndexedDBItem,
  removeItem as removeIndexedDBItem,
  setItem as setIndexedDBItem,
} from './indexedDB';

// 동기 버전 (기존 코드와의 호환성을 위해)
export const getItem = <T>(key: string): T | null => {
  // 동기 버전은 지원하지 않으므로 null 반환
  console.warn(
    'localStorage는 더 이상 지원되지 않습니다. IndexedDB를 사용하세요.'
  );
  return null;
};

export const setItem = (key: string, value: any): void => {
  // 동기 버전은 지원하지 않으므로 무시
  console.warn(
    'localStorage는 더 이상 지원되지 않습니다. IndexedDB를 사용하세요.'
  );
};

export const removeItem = (key: string): void => {
  // 동기 버전은 지원하지 않으므로 무시
  console.warn(
    'localStorage는 더 이상 지원되지 않습니다. IndexedDB를 사용하세요.'
  );
};

// 비동기 버전 (새로운 코드에서 사용)
export const getItemAsync = getIndexedDBItem;
export const setItemAsync = setIndexedDBItem;
export const removeItemAsync = removeIndexedDBItem;

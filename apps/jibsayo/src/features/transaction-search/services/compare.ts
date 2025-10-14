/**
 * 두 값을 깊은 비교합니다. Date 객체도 올바르게 처리합니다.
 */
export function deepEqual<T>(a: T, b: T): boolean {
  // 같은 참조면 true
  if (a === b) return true;

  // null 또는 undefined 체크
  if (a == null || b == null) return a === b;

  // Date 객체 비교
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // 배열 비교
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  // 객체 비교
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a) as Array<keyof T>;
    const keysB = Object.keys(b) as Array<keyof T>;

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  // 원시값 비교
  return a === b;
}

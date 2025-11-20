/**
 * 어제와 오늘의 거래 ID 배열을 비교하여 증가분을 추출합니다.
 * 같은 키의 중복도 계산하여 증가분만큼 ID를 반환합니다.
 *
 * @param currentIds 오늘의 거래 ID 배열
 * @param previousIds 어제의 거래 ID 배열
 * @returns 신규 또는 증가된 거래 ID 배열
 *
 * @example
 * // 어제: [id1, id2], 오늘: [id1, id1, id2, id3]
 * extractNewTransactionIds(['id1', 'id1', 'id2', 'id3'], ['id1', 'id2'])
 * // 반환: ['id1', 'id3']
 * // - id1: 1건 증가 (2 - 1)
 * // - id3: 새로운 ID (1 - 0)
 */
export function extractNewTransactionIds(
  currentIds: string[],
  previousIds: string[]
): string[] {
  // 1. 어제의 ID별 카운트 계산
  const previousIdCounts = new Map<string, number>();
  for (const id of previousIds) {
    previousIdCounts.set(id, (previousIdCounts.get(id) ?? 0) + 1);
  }

  // 2. 오늘의 ID별 카운트 계산
  const currentIdCounts = new Map<string, number>();
  for (const id of currentIds) {
    currentIdCounts.set(id, (currentIdCounts.get(id) ?? 0) + 1);
  }

  // 3. 증가분 계산 (오늘 - 어제, 0보다 큰 것만)
  const newTransactionIds: string[] = [];
  for (const [id, currentCount] of currentIdCounts.entries()) {
    const previousCount = previousIdCounts.get(id) ?? 0;
    const increment = currentCount - previousCount;

    // 증가분만큼 ID 추가
    for (let i = 0; i < increment; i++) {
      newTransactionIds.push(id);
    }
  }

  return newTransactionIds;
}

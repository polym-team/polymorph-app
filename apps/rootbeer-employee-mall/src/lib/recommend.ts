/**
 * MD 추천 — 상품명에 아래 키워드가 있으면 "좋은 상품"으로 추천한다.
 * 리퍼(리퍼브) · 세트/셋트 · 기획(기획세트) · 대용량 · 에디션.
 */
export const RECOMMEND_KEYWORDS = ['리퍼', '세트', '셋트', '기획', '대용량', '에디션'];

export function isRecommended(name: string): boolean {
  return RECOMMEND_KEYWORDS.some((keyword) => name.includes(keyword));
}

/** 상태 라벨 + 웜 뉴트럴 뱃지 톤 (기존 페이지별 중복 딕셔너리 통합) */

export type Tone = 'sage' | 'clay' | 'ocher' | 'terra' | 'neutral';

/** tone → 소프트 뱃지 클래스 */
export const TONE_CLASS: Record<Tone, string> = {
  sage: 'bg-sage-50 text-sage-600',
  clay: 'bg-clay-50 text-clay-600',
  ocher: 'bg-ocher-50 text-ocher-600',
  terra: 'bg-terra-50 text-terra-600',
  neutral: 'bg-line-soft text-ink-600',
};

export interface StatusMeta {
  label: string;
  tone: Tone;
}

/** 주문 라운드 상태 (admin/rounds, my-orders 공용) */
export const ROUND_STATUS: Record<string, StatusMeta> = {
  open: { label: '접수중', tone: 'sage' },
  closed: { label: '마감', tone: 'ocher' },
  ordered: { label: '주문완료', tone: 'clay' },
  settled: { label: '정산완료', tone: 'neutral' },
};

/** 개별 주문 상태 (my-orders) */
export const ORDER_STATUS: Record<string, StatusMeta> = {
  submitted: { label: '제출됨', tone: 'clay' },
  confirmed: { label: '확인됨', tone: 'sage' },
  settled: { label: '정산완료', tone: 'neutral' },
};

/** 구매(발주) 상태 (admin/rounds/[id]) */
export const PURCHASE_STATUS: Record<string, StatusMeta> = {
  pending: { label: '대기', tone: 'neutral' },
  ordered: { label: '주문완료', tone: 'clay' },
  delivered: { label: '배송완료', tone: 'sage' },
  settled: { label: '정산완료', tone: 'clay' },
};

/** 사용자 권한 (admin/users) */
export const ROLE_STATUS: Record<string, StatusMeta> = {
  pending: { label: '승인대기', tone: 'ocher' },
  user: { label: '일반', tone: 'neutral' },
  admin: { label: '관리자', tone: 'clay' },
};

/** 장바구니 아이템 이슈 (cart) */
export const ITEM_ISSUE_LABELS: Record<string, string> = {
  soldout: '품절된 상품입니다',
  removed: '판매 중단된 상품입니다',
  price_changed: '가격이 변경되었습니다',
};

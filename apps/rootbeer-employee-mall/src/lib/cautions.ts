/**
 * 임직원몰 이용 주의사항 (가입 신청·전환 동의 게이트에서 필수 노출 + 체크박스).
 * 운영 정책 문구의 단일 출처 — /migrate·/apply 가 공유한다. 개정 시 여기만 수정.
 * (향후 재동의 필요 시 CAUTIONS_VERSION 을 users.cautions_agreed_at 과 비교)
 */
export const CAUTIONS_VERSION = '2026-07-30';

export interface CautionSection {
  title: string;
  tag?: string;
  critical?: boolean;
  items: string[];
}

export const CAUTIONS_WARNING = '아래 주의사항 미준수 시 주문이 강제 취소될 수 있습니다.';

export const CAUTIONS: CautionSection[] = [
  {
    title: '일반 상품',
    tag: '복지 포인트',
    items: [
      'P포인트(임직원 복지 포인트) 사용 가능 — 단, 사용 시 문의 바랍니다.',
      '포인트는 매년 1월 1일 리셋되니 잔여 포인트 부족에 유의하세요.',
    ],
  },
  {
    title: '퍼시픽샵',
    tag: '재고 상품',
    items: [
      '쿠폰 사용 시 시정에게 문의',
      '사은품 중 유료 멤버십 사용 금지',
      '기본 배송지 선택 해제',
      '"써봐야 안다" 구매 금지',
      '뷰티포인트 · 예치금 · 기프트카드 사용 금지',
    ],
  },
  {
    title: '되팔이 금지',
    critical: true,
    items: [
      '당근마켓 · 중고나라 · 번개장터 판매 금지',
      '되팔이 어뷰징 적발이 자주 발생합니다. 적발 시 즉시 이용이 제한됩니다.',
    ],
  },
];

export const CAUTIONS_AGREE_LABEL = '위 이용 주의사항을 모두 확인했으며 준수하겠습니다.';
export const CAUTIONS_AGREE_SUB = '미준수 시 주문이 강제 취소될 수 있음에 동의합니다.';

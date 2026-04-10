'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from './CartStore';
import { useProductDetailModal, type PreviewProduct } from './ProductStore';

/* ─── Icons ─── */

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const OrderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const AdminIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

/* ─── Constants ─── */

const ISLAND_HEIGHT = 52;
const MODAL_MAX_WIDTH = 480;
const WIDTH_DURATION = '0.3s';
const WIDTH_TRANSITION = `width ${WIDTH_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`;

/* ─── Sub-components ─── */

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  activePrefix?: string;
}

function DetailActions({ previewProduct }: { previewProduct: PreviewProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const { options, selectedOption } = useProductDetailModal();
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // 모달이 바뀌면 added 초기화
  useEffect(() => { setAdded(false); }, [previewProduct.id]);

  const hasOptions = options.length > 0;
  const needsOption = hasOptions && !selectedOption;
  const isDisabled = previewProduct.soldOut || needsOption;

  const handleAddToCart = () => {
    addItem({
      productId: previewProduct.id,
      optionId: selectedOption?.id ?? null,
      optionName: selectedOption?.name ?? null,
      name: previewProduct.name,
      brand: previewProduct.brand ?? null,
      price: selectedOption?.salePrice ?? previewProduct.salePrice,
      store: previewProduct.store,
      imageUrl: previewProduct.imageUrl ?? null,
    });
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1500);
  };

  let buttonText = '장바구니 담기';
  if (previewProduct.soldOut) buttonText = '품절';
  else if (needsOption) buttonText = '옵션을 선택해주세요';
  else if (added) buttonText = '담김!';

  return (
    <>
      <button
        onClick={() => window.history.back()}
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-white transition-colors"
      >
        <BackIcon />
      </button>
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`flex-1 min-w-0 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors ${
          added
            ? 'bg-green-500'
            : 'bg-accent-500 hover:bg-accent-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed'
        }`}
      >
        {buttonText}
      </button>
    </>
  );
}

/* ─── Main ─── */

export function BottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.items.length);
  const { productId, previewProduct, isClosing } = useProductDetailModal();
  const [navWidth, setNavWidth] = useState(0);

  // callback ref: DOM에 붙는 순간 1회 측정 — effect 타이밍 이슈 없음
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setNavWidth(node.scrollWidth);
  }, []);

  if (!session || session.user.role === 'pending') return null;

  // isClosing이면 모달 축소와 동시에 아일랜드도 네비 모드로 전환
  const isDetailMode = productId !== null && !isClosing;
  const measured = navWidth > 0;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 480;
  const detailWidth = Math.min(vw, MODAL_MAX_WIDTH);

  // 측정 전: auto(자연 크기). 측정 후: 항상 명시적 px → CSS transition 가능
  const targetWidth = measured ? (isDetailMode ? detailWidth : navWidth) : undefined;

  const items: NavItem[] = [
    { href: '/', label: '홈', icon: <HomeIcon /> },
    { href: '/cart', label: '장바구니', icon: <CartIcon />, badge: itemCount },
    { href: '/my-orders', label: '내 주문', icon: <OrderIcon /> },
    ...(session.user.role === 'admin'
      ? [{ href: '/admin/rounds', label: '관리', icon: <AdminIcon />, activePrefix: '/admin' }]
      : []),
  ];

  return (
    <div className="fixed bottom-5 inset-x-0 z-[60] flex justify-center pointer-events-none">
      <nav
        className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/30 pointer-events-auto overflow-hidden"
        style={{
          height: ISLAND_HEIGHT,
          width: targetWidth,
          transition: measured ? WIDTH_TRANSITION : 'none',
        }}
      >
        {/* 네비: normal flow → 자연 너비 결정 */}
        <div
          ref={measureRef}
          className="flex items-center gap-1 px-1 w-fit"
          style={{
            height: ISLAND_HEIGHT,
            opacity: isDetailMode ? 0 : 1,
            // 복귀 시: width 전환 끝난 뒤 즉시 등장 / 진입 시: 즉시 사라짐
            transition: isDetailMode ? 'none' : `opacity 0s ${WIDTH_DURATION}`,
            pointerEvents: isDetailMode ? 'none' : 'auto',
          }}
        >
          {items.map((item) => {
            const matchPath = item.activePrefix ?? item.href;
            const isActive = matchPath === '/' ? pathname === '/' : pathname.startsWith(matchPath);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-accent-500 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium leading-none whitespace-nowrap">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`absolute -top-1 -right-0.5 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                      isActive ? 'bg-white text-accent-500' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* 상세 액션: absolute 오버레이 */}
        <div
          className="absolute inset-0 flex items-center gap-2 px-3"
          style={{
            opacity: isDetailMode ? 1 : 0,
            // 진입 시: width 전환 끝난 뒤 즉시 등장 / 복귀 시: 즉시 사라짐
            transition: isDetailMode ? `opacity 0s ${WIDTH_DURATION}` : 'none',
            pointerEvents: isDetailMode ? 'auto' : 'none',
          }}
        >
          {previewProduct && <DetailActions previewProduct={previewProduct} />}
        </div>
      </nav>
    </div>
  );
}

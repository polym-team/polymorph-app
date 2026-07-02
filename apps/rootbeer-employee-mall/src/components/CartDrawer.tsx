'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from './UiStore';
import { useCartStore } from './CartStore';
import { STORE_LABELS } from '@/types';
import { formatPrice } from '@/lib/format';

export function CartDrawer() {
  const router = useRouter();
  const open = useUiStore((s) => s.cartOpen);
  const closeCart = useUiStore((s) => s.closeCart);
  const { items, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeCart]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const goCheckout = () => {
    closeCart();
    router.push('/cart');
  };

  return (
    <>
      {/* scrim */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-[80] bg-ink-900/40 transition-opacity duration-300 ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      />
      {/* drawer */}
      <aside
        className={`fixed top-0 right-0 z-[90] h-full w-[86%] max-w-sm bg-paper shadow-lift flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-line">
          <div>
            <span className="block text-[10px] tracking-[0.15em] text-clay-500 italic" style={{ fontFamily: 'Georgia, serif' }}>
              YOUR BAG
            </span>
            <h2 className="text-lg font-bold text-ink-900">장바구니</h2>
          </div>
          <button onClick={closeCart} className="text-sm text-ink-600 px-2 py-2">닫기</button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div>
              <p className="text-ink-600 mb-1">장바구니가 비어있습니다</p>
              <p className="text-sm text-ink-400">마음에 드는 상품을 담아보세요</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <div key={`${item.productId}-${item.optionId}`} className="flex gap-3 py-4 border-b border-line-soft">
                  <div className="w-16 h-16 rounded-xl bg-line-soft flex-shrink-0 overflow-hidden">
                    {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10.5px] text-ink-400">
                      {STORE_LABELS[item.store]}{item.brand && ` · ${item.brand}`}
                    </p>
                    <p className="text-[13px] text-ink-900 leading-snug line-clamp-2 mb-2">
                      {item.name}
                      {item.optionName && <span className="text-ink-400"> · {item.optionName}</span>}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-3 border border-line rounded-full px-1 py-0.5">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.optionId)} className="w-6 h-6 text-ink-600" aria-label="감소">−</button>
                        <span className="text-[13px] tnum w-3 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.optionId)} className="w-6 h-6 text-ink-600" aria-label="증가">+</button>
                      </div>
                      <span className="text-[13.5px] font-bold text-ink-900 tnum">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.productId, item.optionId)} className="text-ink-400 hover:text-terra-600 self-start text-xs" aria-label="삭제">✕</button>
                </div>
              ))}
            </div>

            <div className="border-t border-line px-5 pt-4 pb-5 bg-paper-card">
              <div className="flex justify-between text-[13px] text-ink-600 mb-1">
                <span>상품 합계</span>
                <span className="tnum">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-ink-400 mb-3">
                <span>배송비</span>
                <span>합배송 정산 시 확정</span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink-900 mb-4">
                <span>합계</span>
                <span className="tnum">{formatPrice(total)}</span>
              </div>
              <button
                onClick={goCheckout}
                className="w-full bg-ink-900 text-paper text-sm font-semibold py-3.5 rounded-full hover:bg-clay-600 transition-colors"
              >
                주문하기
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useCartStore, type CartItem } from '@/components/CartStore';
import { STORE_LABELS, DELIVERY_LABELS } from '@/types';
import type { Product, OrderRound } from '@/types';
import { Button, SectionCard, EmptyState, PageHeader, fieldClass } from '@/components/ui';
import { ITEM_ISSUE_LABELS } from '@/lib/status';
import { formatPrice, formatDateTime } from '@/lib/format';

type ItemIssue = 'soldout' | 'removed' | 'price_changed' | null;

function getItemIssue(item: CartItem, productsMap: Map<number, Product>): ItemIssue {
  const product = productsMap.get(item.productId);
  if (!product) return 'removed';
  if (product.soldOut) return 'soldout';
  if (product.salePrice !== item.price) return 'price_changed';
  return null;
}

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    items, deliveryLocation, customDelivery,
    removeItem, updateQuantity, setDeliveryLocation, setCustomDelivery, clear,
  } = useCartStore();
  const [openRounds, setOpenRounds] = useState<OrderRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/rounds').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([rounds, prods]) => {
      const open = (rounds as OrderRound[]).filter((r) => r.status === 'open');
      setOpenRounds(open);
      if (open.length > 0) setSelectedRoundId(open[0].id);
      setProducts(prods);
      setProductsLoaded(true);
    });
  }, []);

  const productsMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  if (!session || session.user.role === 'pending') {
    return <div className="text-center py-12 text-ink-600">로그인이 필요합니다.</div>;
  }

  const itemsWithIssues = items.map((item) => ({
    ...item,
    issue: productsLoaded ? getItemIssue(item, productsMap) : null,
  }));

  const validItems = itemsWithIssues.filter(
    (i) => i.issue === null || i.issue === 'price_changed',
  );
  const hasBlockingIssues = itemsWithIssues.some(
    (i) => i.issue === 'soldout' || i.issue === 'removed',
  );

  const byStore = itemsWithIssues.reduce(
    (acc, item) => {
      if (!acc[item.store]) acc[item.store] = [];
      acc[item.store].push(item);
      return acc;
    },
    {} as Record<string, typeof itemsWithIssues>,
  );

  const storeSubtotals = Object.entries(byStore).map(([store, storeItems]) => ({
    store,
    subtotal: storeItems
      .filter((i) => i.issue !== 'soldout' && i.issue !== 'removed')
      .reduce((sum, i) => sum + i.price * i.quantity, 0),
    items: storeItems,
  }));

  const SHIPPING_FEE = 2500;
  const FREE_SHIPPING_THRESHOLD = 20000;

  const shippingByStore = deliveryLocation === 'custom'
    ? storeSubtotals.map((s) => ({
        store: s.store,
        fee: s.subtotal > 0 && s.subtotal <= FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0,
      }))
    : [];

  const totalShipping = shippingByStore.reduce((sum, s) => sum + s.fee, 0);
  const grandSubtotal = storeSubtotals.reduce((sum, s) => sum + s.subtotal, 0);
  const grandTotal = grandSubtotal + totalShipping;

  const isCustomValid =
    deliveryLocation !== 'custom' ||
    (customDelivery.name.trim() && customDelivery.phone.trim() && customDelivery.address.trim());

  const handleSubmit = async () => {
    if (!selectedRoundId || !isCustomValid) return;
    setSubmitting(true);

    try {
      const submitItems = validItems.map((i) => {
        const product = productsMap.get(i.productId);
        return {
          productId: i.productId,
          optionId: i.optionId,
          optionName: i.optionName,
          quantity: i.quantity,
          price: product ? product.salePrice : i.price,
        };
      });

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: selectedRoundId,
          deliveryLocation,
          ...(deliveryLocation === 'custom' ? {
            customName: customDelivery.name.trim(),
            customPhone: customDelivery.phone.trim(),
            customAddress: customDelivery.address.trim(),
          } : {}),
          items: submitItems,
        }),
      });

      if (res.ok) {
        clear();
        router.push('/my-orders');
      } else {
        const data = await res.json();
        alert(data.error || '주문 실패');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="장바구니" subtitle={items.length > 0 ? `${items.length}개 상품` : undefined} />

      {items.length === 0 ? (
        <EmptyState title="장바구니가 비어있습니다" />
      ) : (
        <>
          {hasBlockingIssues && (
            <div className="bg-terra-50 border border-terra-500/20 rounded-lg p-3 mb-4 text-sm text-terra-600">
              일부 상품이 품절되었거나 판매 중단되었습니다. 해당 상품을 삭제한 후 주문할 수 있습니다.
            </div>
          )}

          {storeSubtotals.map(({ store, subtotal, items: storeItems }) => (
            <div key={store} className="mb-6">
              <h2 className="font-medium text-sm text-ink-600 mb-2">
                {STORE_LABELS[store as keyof typeof STORE_LABELS]}
              </h2>
              <SectionCard className="divide-y divide-line">
                {storeItems.map((item) => {
                  const isUnavailable = item.issue === 'soldout' || item.issue === 'removed';
                  const isPriceChanged = item.issue === 'price_changed';
                  const currentProduct = productsMap.get(item.productId);

                  return (
                    <div
                      key={item.productId}
                      className={`p-3 flex items-center gap-3 ${isUnavailable ? 'bg-line-soft opacity-50' : ''}`}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className={`w-14 h-14 object-cover rounded-lg ${isUnavailable ? 'grayscale' : ''}`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isUnavailable ? 'line-through text-ink-400' : 'text-ink-900'}`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-ink-400">
                          {item.brand}
                          {item.optionName && <span className="ml-1">· {item.optionName}</span>}
                        </p>
                        {isUnavailable ? (
                          <p className="text-xs text-terra-600 font-medium mt-0.5">
                            {ITEM_ISSUE_LABELS[item.issue!]}
                          </p>
                        ) : isPriceChanged ? (
                          <div className="mt-0.5 tnum">
                            <span className="text-xs text-ink-400 line-through mr-1">
                              {formatPrice(item.price)}
                            </span>
                            <span className="text-sm font-medium text-ocher-600">
                              {formatPrice(currentProduct!.salePrice)}
                            </span>
                            <p className="text-xs text-ocher-600">가격이 변경되었습니다</p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-ink-900 tnum">{formatPrice(item.price)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isUnavailable ? (
                          <button
                            onClick={() => removeItem(item.productId, item.optionId)}
                            className="text-xs text-terra-600 font-medium"
                          >
                            삭제
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.optionId)}
                              className="w-7 h-7 border border-line rounded text-sm text-ink-600 hover:border-clay-500/50 transition-colors"
                            >
                              -
                            </button>
                            <span className="text-sm w-6 text-center tnum">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.optionId)}
                              className="w-7 h-7 border border-line rounded text-sm text-ink-600 hover:border-clay-500/50 transition-colors"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeItem(item.productId, item.optionId)}
                              className="text-xs text-ink-400 hover:text-terra-600 ml-2 transition-colors"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </SectionCard>
              <p className="text-right text-sm mt-1.5 text-ink-600 tnum">
                소계 {formatPrice(subtotal)}
              </p>
            </div>
          ))}

          <SectionCard className="p-4 mb-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-900 block mb-2">주문 라운드</label>
              {openRounds.length === 0 ? (
                <p className="text-sm text-ocher-600">열려있는 라운드가 없습니다.</p>
              ) : (
                <select
                  value={selectedRoundId ?? ''}
                  onChange={(e) => setSelectedRoundId(Number(e.target.value))}
                  className={fieldClass}
                >
                  {openRounds.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || `라운드 #${r.id}`}
                      {r.deadline && ` (마감: ${formatDateTime(r.deadline)})`}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-ink-900 block mb-2">배송지</label>
              <select
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value as 'pangyo' | 'jeju' | 'custom')}
                className={fieldClass}
              >
                {Object.entries(DELIVERY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            {deliveryLocation === 'custom' && (
              <div className="space-y-2 pt-3 border-t border-line">
                <p className="text-xs text-ocher-600">
                  특정 배송지는 단독 주문으로 처리되며 합배송이 적용되지 않습니다.
                </p>
                <input
                  type="text"
                  placeholder="수령인 이름"
                  value={customDelivery.name}
                  onChange={(e) => setCustomDelivery({ ...customDelivery, name: e.target.value })}
                  className={fieldClass}
                />
                <input
                  type="text"
                  placeholder="연락처"
                  value={customDelivery.phone}
                  onChange={(e) => setCustomDelivery({ ...customDelivery, phone: e.target.value })}
                  className={fieldClass}
                />
                <input
                  type="text"
                  placeholder="배송 주소"
                  value={customDelivery.address}
                  onChange={(e) => setCustomDelivery({ ...customDelivery, address: e.target.value })}
                  className={fieldClass}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard className="p-4 mb-4 tnum">
            <div className="flex justify-between text-sm text-ink-600">
              <span>상품 합계</span>
              <span>{formatPrice(grandSubtotal)}</span>
            </div>
            {deliveryLocation === 'custom' && shippingByStore.length > 0 && (
              <div className="mt-2 space-y-1">
                {shippingByStore.map((s) => (
                  <div key={s.store} className="flex justify-between text-xs text-ink-400">
                    <span>
                      {STORE_LABELS[s.store as keyof typeof STORE_LABELS]} 배송비
                      {s.fee === 0 ? ' (무료)' : ''}
                    </span>
                    <span>{s.fee > 0 ? `+${formatPrice(s.fee)}` : '0원'}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between font-bold text-ink-900 mt-2 pt-2 border-t border-line">
              <span>합계</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
            <p className="text-xs text-ink-400 mt-2 leading-relaxed">
              {deliveryLocation === 'custom'
                ? '특정 배송지는 단독 주문으로 처리되며, 마켓별 2만원 이하 시 배송비 2,500원이 부과됩니다.'
                : '배송비는 합배송 여부에 따라 정산 시 확정됩니다. 마켓별로 2만원 이하인 경우 배송비가 발생합니다. 다른 주문과 합산되어 배송비가 발생되지 않을때만 주문됩니다.'}
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || !selectedRoundId || hasBlockingIssues || validItems.length === 0 || !isCustomValid}
              className="w-full mt-4"
            >
              {submitting ? '주문 제출 중...' : `주문 제출 · ${formatPrice(grandTotal)}`}
            </Button>
          </SectionCard>
        </>
      )}
    </div>
  );
}

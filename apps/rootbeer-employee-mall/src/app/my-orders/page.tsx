'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { STORE_LABELS, DELIVERY_LABELS } from '@/types';
import { SectionCard, StatusBadge, EmptyState, PageHeader } from '@/components/ui';
import { ORDER_STATUS, ROUND_STATUS } from '@/lib/status';
import { formatDate, formatPrice } from '@/lib/format';

interface OrderData {
  id: number;
  roundId: number;
  deliveryLocation: string;
  customName: string | null;
  customPhone: string | null;
  customAddress: string | null;
  status: string;
  createdAt: string;
  settledAt: string | null;
  matchedDepositId: string | null;
  shippingShare: number;
  round: { title: string | null; status: string };
  items: {
    id: number;
    quantity: number;
    priceAtOrder: number;
    status: 'active' | 'soldout';
    product: {
      name: string;
      brand: string | null;
      store: string;
      imageUrl: string | null;
    };
    purchaseItems: {
      purchase: {
        externalOrderNo: string | null;
        status: string;
      };
    }[];
  }[];
}

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, [session]);

  if (!session) return null;
  if (loading) return <div className="text-center py-12 text-ink-600">로딩 중...</div>;

  const handleCancel = async (orderId: number) => {
    if (!confirm('주문을 취소하시겠습니까?')) return;
    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="내 주문" subtitle={orders.length > 0 ? `${orders.length}건` : undefined} />

      {orders.length === 0 ? (
        <EmptyState title="주문 내역이 없습니다" />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemsTotal = order.items
              .filter((i) => i.status === 'active')
              .reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0);
            const shippingShare = order.shippingShare ?? 0;
            const total = itemsTotal + shippingShare;

            return (
              <SectionCard key={order.id}>
                <div className="p-3 border-b border-line flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-ink-900">
                      {order.round.title || `라운드 #${order.roundId}`}
                    </span>
                    <span className="text-xs text-ink-400 ml-2">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ROUND_STATUS[order.round.status] ?? ROUND_STATUS.open} />
                    <StatusBadge status={ORDER_STATUS[order.status] ?? ORDER_STATUS.submitted} />
                    {order.round.status === 'open' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="text-xs text-ink-400 hover:text-terra-600 transition-colors"
                      >
                        취소
                      </button>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-line">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 flex items-center gap-3 ${item.status === 'soldout' ? 'bg-terra-50 opacity-60' : ''}`}
                    >
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${item.status === 'soldout' ? 'line-through text-ink-400' : 'text-ink-900'}`}>
                          {item.product.name}
                        </p>
                        <p className="text-xs text-ink-400">
                          {STORE_LABELS[item.product.store as keyof typeof STORE_LABELS]} ·{' '}
                          {item.product.brand}
                        </p>
                        {item.status === 'soldout' && (
                          <span className="text-xs text-terra-600 font-medium">품절</span>
                        )}
                        {item.status === 'active' && item.purchaseItems.length > 0 && (
                          <span className="text-xs text-sage-600">
                            {item.purchaseItems[0].purchase.externalOrderNo
                              ? `주문번호: ${item.purchaseItems[0].purchase.externalOrderNo}`
                              : '구매 진행중'}
                          </span>
                        )}
                      </div>
                      <div className="text-right text-sm tnum">
                        <p className={item.status === 'soldout' ? 'line-through text-ink-400' : 'text-ink-900'}>
                          {formatPrice(item.priceAtOrder)}
                        </p>
                        <p className="text-xs text-ink-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-line text-sm space-y-1 tnum">
                  <div className="flex justify-between text-ink-600">
                    <span>
                      {order.deliveryLocation === 'custom'
                        ? `${order.customName} / ${order.customPhone} / ${order.customAddress}`
                        : DELIVERY_LABELS[order.deliveryLocation] ?? order.deliveryLocation}
                    </span>
                    <span>{formatPrice(itemsTotal)}</span>
                  </div>
                  {shippingShare > 0 && (
                    <div className="flex justify-between text-ink-600">
                      <span>배송비 분담</span>
                      <span>{formatPrice(shippingShare)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-ink-900 pt-1">
                    <span>합계</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                {order.matchedDepositId ? (
                  <div className="p-3 border-t border-line bg-sage-50 text-sm">
                    <p className="font-medium text-sage-600 mb-1">✓ 입금 확인 완료</p>
                    <p className="text-ink-900">
                      {formatPrice(total)} 입금이 자동으로 확인되었습니다.
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      {order.settledAt && <>확인 시각: {formatDate(order.settledAt)} · </>}
                      확인번호: {order.matchedDepositId.slice(0, 16)}
                    </p>
                  </div>
                ) : (
                  order.round.status === 'ordered' && (
                    <div className="p-3 border-t border-line bg-clay-50 text-sm">
                      <p className="font-medium text-clay-600 mb-1">입금 안내</p>
                      <p className="text-ink-900">우리은행 1002-854-981268 (예금주: 임흥선)</p>
                      <p className="text-ink-900 font-medium mt-0.5">
                        입금액 {formatPrice(total)}
                      </p>
                      <p className="text-xs text-ink-600 mt-1">
                        위 계좌로 <span className="font-medium">정확한 금액</span>을 입금해주세요.
                        입금이 확인되면 <span className="font-medium">자동으로 정산 완료</span>로
                        바뀝니다. (예금주명과 입금액으로 자동 매칭)
                      </p>
                    </div>
                  )
                )}
              </SectionCard>
            );
          })}
        </div>
      )}

      {/* 계정 정보 + 로그아웃 */}
      <div className="mt-8 pt-6 border-t border-line text-center">
        <p className="text-xs text-ink-400 mb-2">{session.user.email}</p>
        <button
          onClick={() => signOut()}
          className="text-xs text-ink-400 hover:text-ink-600 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

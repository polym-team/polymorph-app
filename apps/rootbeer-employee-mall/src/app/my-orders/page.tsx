'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { STORE_LABELS, DELIVERY_LABELS } from '@/types';

interface OrderData {
  id: number;
  roundId: number;
  deliveryLocation: string;
  status: string;
  createdAt: string;
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

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  submitted: { text: '제출됨', color: 'bg-blue-100 text-blue-800' },
  confirmed: { text: '확인됨', color: 'bg-green-100 text-green-800' },
  settled: { text: '정산완료', color: 'bg-gray-100 text-gray-800' },
};

const ROUND_STATUS_LABELS: Record<string, { text: string; color: string }> = {
  open: { text: '접수중', color: 'bg-green-100 text-green-800' },
  closed: { text: '마감', color: 'bg-yellow-100 text-yellow-800' },
  ordered: { text: '주문완료', color: 'bg-blue-100 text-blue-800' },
  settled: { text: '정산완료', color: 'bg-gray-100 text-gray-800' },
};

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
  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  const handleCancel = async (orderId: number) => {
    if (!confirm('주문을 취소하시겠습니까?')) return;
    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">내 주문</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">주문 내역이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const total = order.items.reduce(
              (sum, i) => sum + i.priceAtOrder * i.quantity,
              0,
            );
            const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.submitted;

            return (
              <div key={order.id} className="bg-white rounded border">
                <div className="p-3 border-b flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      {order.round.title || `라운드 #${order.roundId}`}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const roundInfo = ROUND_STATUS_LABELS[order.round.status] ?? ROUND_STATUS_LABELS.open;
                      return (
                        <span className={`text-xs px-2 py-0.5 rounded ${roundInfo.color}`}>
                          {roundInfo.text}
                        </span>
                      );
                    })()}
                    <span className={`text-xs px-2 py-0.5 rounded ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                    {order.round.status === 'open' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="text-xs text-red-500"
                      >
                        취소
                      </button>
                    )}
                  </div>
                </div>
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 flex items-center gap-3 ${item.status === 'soldout' ? 'bg-red-50 opacity-60' : ''}`}
                    >
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt=""
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${item.status === 'soldout' ? 'line-through' : ''}`}>
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {STORE_LABELS[item.product.store as keyof typeof STORE_LABELS]} ·{' '}
                          {item.product.brand}
                        </p>
                        {item.status === 'soldout' && (
                          <span className="text-xs text-red-600 font-medium">품절</span>
                        )}
                        {item.status === 'active' && item.purchaseItems.length > 0 && (
                          <span className="text-xs text-green-600">
                            {item.purchaseItems[0].purchase.externalOrderNo
                              ? `주문번호: ${item.purchaseItems[0].purchase.externalOrderNo}`
                              : '구매 진행중'}
                          </span>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className={item.status === 'soldout' ? 'line-through text-gray-400' : ''}>
                          {item.priceAtOrder.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t flex justify-between text-sm">
                  <span className="text-gray-500">
                    {DELIVERY_LABELS[order.deliveryLocation] ?? order.deliveryLocation}
                  </span>
                  <span className="font-bold">{total.toLocaleString()}원</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

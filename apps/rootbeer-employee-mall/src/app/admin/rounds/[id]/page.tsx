'use client';

import { useEffect, useState, use } from 'react';
import { STORE_LABELS } from '@/types';
import type { SettlementRow, Store } from '@/types';

interface OrderRow {
  order_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  delivery_location: string;
  custom_name: string | null;
  custom_phone: string | null;
  custom_address: string | null;
  order_status: string;
  item_id: number;
  product_id: number;
  product_name: string;
  product_brand: string;
  product_store: string;
  product_image_url: string;
  quantity: number;
  price_at_order: number;
  item_status: 'active' | 'soldout';
}

interface PurchaseData {
  id: number;
  store: string;
  external_order_no: string | null;
  shipping_fee: number;
  status: string;
  ordered_at: string | null;
  created_at: string;
}

interface PurchaseItemData {
  purchase_id: number;
  order_item_id: number;
  quantity: number;
}

interface RoundDetail {
  round: { id: number; title: string; status: string; deadline: string; created_at: string };
  orders: OrderRow[];
  purchases: PurchaseData[];
  purchaseItems: PurchaseItemData[];
}

type Tab = 'orders' | 'purchases' | 'settlement';

const PURCHASE_STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: '대기', color: 'bg-gray-100 text-gray-800' },
  ordered: { text: '주문완료', color: 'bg-blue-100 text-blue-800' },
  delivered: { text: '배송완료', color: 'bg-green-100 text-green-800' },
  settled: { text: '정산완료', color: 'bg-purple-100 text-purple-800' },
};

export default function RoundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<RoundDetail | null>(null);
  const [settlement, setSettlement] = useState<SettlementRow[]>([]);
  const [tab, setTab] = useState<Tab>('orders');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [roundRes, settlementRes] = await Promise.all([
      fetch(`/api/rounds/${id}`).then((r) => r.json()),
      fetch(`/api/rounds/${id}/settlement`).then((r) => r.json()),
    ]);
    setData(roundRes);
    setSettlement(settlementRes);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading || !data) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  const { round, orders, purchases, purchaseItems } = data;

  // Group orders by store
  const byStore = orders.reduce(
    (acc, row) => {
      const store = row.product_store as Store;
      if (!acc[store]) acc[store] = [];
      acc[store].push(row);
      return acc;
    },
    {} as Record<Store, OrderRow[]>,
  );

  // Check which items are already assigned to a purchase
  const assignedItemIds = new Set(purchaseItems.map((pi) => pi.order_item_id));
  const isOpen = round.status === 'open';

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/rounds/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const handleCreatePurchase = async (store: Store) => {
    const items = Array.from(selectedItems)
      .filter((itemId) => {
        const row = orders.find((o) => o.item_id === itemId);
        return row?.product_store === store;
      })
      .map((itemId) => {
        const row = orders.find((o) => o.item_id === itemId)!;
        return { orderItemId: itemId, quantity: row.quantity };
      });

    if (items.length === 0) {
      alert('해당 마켓의 상품을 선택해주세요.');
      return;
    }

    await fetch(`/api/rounds/${id}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store, orderItemIds: items }),
    });

    setSelectedItems(new Set());
    fetchData();
  };

  const handleUpdatePurchase = async (
    purchaseId: number,
    updates: { externalOrderNo?: string; shippingFee?: number; status?: string },
  ) => {
    await fetch(`/api/rounds/${id}/purchases`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId, ...updates }),
    });
    fetchData();
  };

  const handleItemStatus = async (orderItemIds: number[], status: 'active' | 'soldout') => {
    await fetch(`/api/rounds/${id}/items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderItemIds, status }),
    });
    setSelectedItems(new Set());
    fetchData();
  };

  const toggleItem = (itemId: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const selectAllForStore = (store: Store) => {
    const storeItems = (byStore[store] ?? [])
      .filter((row) => !assignedItemIds.has(row.item_id))
      .map((row) => row.item_id);
    setSelectedItems((prev) => {
      const next = new Set(prev);
      const allSelected = storeItems.every((id) => next.has(id));
      if (allSelected) {
        storeItems.forEach((id) => next.delete(id));
      } else {
        storeItems.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">
            {round.title || `라운드 #${round.id}`}
          </h1>
          <p className="text-xs text-gray-400">
            {new Date(round.created_at).toLocaleDateString('ko-KR')}
            {round.deadline && ` · 마감: ${round.deadline}`}
          </p>
        </div>
        <div className="flex gap-2">
          {round.status === 'open' && (
            <button
              onClick={() => handleStatusChange('closed')}
              className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600"
            >
              마감
            </button>
          )}
          {round.status === 'closed' && (
            <button
              onClick={() => handleStatusChange('ordered')}
              className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600"
            >
              주문완료 처리
            </button>
          )}
          {round.status === 'ordered' && (
            <button
              onClick={() => handleStatusChange('settled')}
              className="text-xs bg-purple-500 text-white px-3 py-1.5 rounded hover:bg-purple-600"
            >
              정산완료
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-4 border-b">
        {[
          { key: 'orders' as Tab, label: `주문 (${orders.length})` },
          { key: 'purchases' as Tab, label: `구매 (${purchases.length})` },
          { key: 'settlement' as Tab, label: '정산표' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === t.key
                ? 'border-black text-black font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-6">
          {isOpen && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              라운드가 마감된 이후에 상품 배정 및 구매 생성이 가능합니다.
            </div>
          )}
          {(Object.entries(byStore) as [Store, OrderRow[]][]).map(([store, rows]) => {
            const storeTotal = rows.reduce((sum, r) => sum + r.price_at_order * r.quantity, 0);
            const unassigned = rows.filter((r) => !assignedItemIds.has(r.item_id));

            return (
              <div key={store}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-medium">
                    {STORE_LABELS[store]} · {storeTotal.toLocaleString()}원
                  </h2>
                  <div className="flex gap-2">
                    {!isOpen && unassigned.length > 0 && (
                      <>
                        <button
                          onClick={() => selectAllForStore(store)}
                          className="text-xs text-blue-600"
                        >
                          미배정 전체선택
                        </button>
                        {selectedItems.size > 0 && (
                          <button
                            onClick={() => handleItemStatus(
                              Array.from(selectedItems).filter((itemId) => {
                                const row = orders.find((o) => o.item_id === itemId);
                                return row?.product_store === store;
                              }),
                              'soldout',
                            )}
                            className="text-xs bg-red-500 text-white px-3 py-1 rounded"
                          >
                            품절 처리
                          </button>
                        )}
                        <button
                          onClick={() => handleCreatePurchase(store)}
                          className="text-xs bg-black text-white px-3 py-1 rounded"
                        >
                          구매 생성
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="p-2 w-8"></th>
                        <th className="p-2">주문자</th>
                        <th className="p-2">상품</th>
                        <th className="p-2 text-right">수량</th>
                        <th className="p-2 text-right">금액</th>
                        <th className="p-2 text-center">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rows.map((row) => {
                        const assigned = assignedItemIds.has(row.item_id);
                        const isSoldout = row.item_status === 'soldout';
                        return (
                          <tr
                            key={row.item_id}
                            className={
                              isSoldout ? 'bg-red-50 opacity-60' : assigned ? 'bg-green-50' : ''
                            }
                          >
                            <td className="p-2">
                              {!isOpen && !assigned && !isSoldout && (
                                <input
                                  type="checkbox"
                                  checked={selectedItems.has(row.item_id)}
                                  onChange={() => toggleItem(row.item_id)}
                                />
                              )}
                            </td>
                            <td className="p-2">
                              <p className="font-medium">{row.user_name}</p>
                              {row.delivery_location === 'custom' && (
                                <span className="text-xs text-orange-600 block" title={`${row.custom_name} / ${row.custom_phone} / ${row.custom_address}`}>
                                  개별배송
                                </span>
                              )}
                            </td>
                            <td className="p-2">
                              <p className={`truncate max-w-xs ${isSoldout ? 'line-through' : ''}`}>
                                {row.product_name}
                              </p>
                              <p className="text-xs text-gray-400">{row.product_brand}</p>
                            </td>
                            <td className="p-2 text-right">{row.quantity}</td>
                            <td className="p-2 text-right">
                              {(row.price_at_order * row.quantity).toLocaleString()}원
                            </td>
                            <td className="p-2 text-center">
                              {isSoldout ? (
                                <span className="flex items-center justify-center gap-1">
                                  <span className="text-xs text-red-600 font-medium">품절</span>
                                  {!isOpen && (
                                    <button
                                      onClick={() => handleItemStatus([row.item_id], 'active')}
                                      className="text-xs text-blue-500 underline"
                                    >
                                      복구
                                    </button>
                                  )}
                                </span>
                              ) : assigned ? (
                                <span className="text-xs text-green-600">배정됨</span>
                              ) : (
                                <span className="text-xs text-gray-400">미배정</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'purchases' && (
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              생성된 구매가 없습니다. 주문 탭에서 상품을 선택하여 구매를 생성하세요.
            </div>
          ) : (
            purchases.map((purchase) => {
              const items = purchaseItems.filter((pi) => pi.purchase_id === purchase.id);
              const itemDetails = items
                .map((pi) => orders.find((o) => o.item_id === pi.order_item_id))
                .filter(Boolean) as OrderRow[];
              const purchaseTotal = itemDetails.reduce(
                (sum, d) => sum + d.price_at_order * d.quantity,
                0,
              );
              const statusInfo = PURCHASE_STATUS_LABELS[purchase.status];

              return (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  itemDetails={itemDetails}
                  purchaseTotal={purchaseTotal}
                  statusInfo={statusInfo}
                  onUpdate={handleUpdatePurchase}
                />
              );
            })
          )}
        </div>
      )}

      {tab === 'settlement' && (
        <div>
          {settlement.length === 0 ? (
            <div className="text-center py-12 text-gray-400">주문 데이터가 없습니다.</div>
          ) : (
            <div className="bg-white rounded border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3">이름</th>
                    <th className="p-3 text-right">상품 합계</th>
                    <th className="p-3 text-right">배송비 분담</th>
                    <th className="p-3 text-right font-bold">정산 금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {settlement.map((row) => (
                    <tr key={row.user_id}>
                      <td className="p-3">
                        <p className="font-medium">{row.user_name}</p>
                        <p className="text-xs text-gray-400">{row.user_email}</p>
                      </td>
                      <td className="p-3 text-right">{row.items_total.toLocaleString()}원</td>
                      <td className="p-3 text-right">{row.shipping_share.toLocaleString()}원</td>
                      <td className="p-3 text-right font-bold">{row.total.toLocaleString()}원</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td className="p-3">합계</td>
                    <td className="p-3 text-right">
                      {settlement.reduce((s, r) => s + r.items_total, 0).toLocaleString()}원
                    </td>
                    <td className="p-3 text-right">
                      {settlement.reduce((s, r) => s + r.shipping_share, 0).toLocaleString()}원
                    </td>
                    <td className="p-3 text-right">
                      {settlement.reduce((s, r) => s + r.total, 0).toLocaleString()}원
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PurchaseCard({
  purchase,
  itemDetails,
  purchaseTotal,
  statusInfo,
  onUpdate,
}: {
  purchase: PurchaseData;
  itemDetails: OrderRow[];
  purchaseTotal: number;
  statusInfo: { text: string; color: string };
  onUpdate: (id: number, updates: Record<string, unknown>) => Promise<void>;
}) {
  const [orderNo, setOrderNo] = useState(purchase.external_order_no ?? '');
  const [shippingFee, setShippingFee] = useState(String(purchase.shipping_fee));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(purchase.id, {
      externalOrderNo: orderNo,
      shippingFee: Number(shippingFee),
      status: 'ordered',
    });
    setSaving(false);
  };

  return (
    <div className="bg-white rounded border">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {STORE_LABELS[purchase.store as keyof typeof STORE_LABELS]}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
          <span className="text-xs text-gray-400">
            {purchaseTotal.toLocaleString()}원 · {itemDetails.length}개 항목
          </span>
        </div>
      </div>

      <div className="p-3 text-sm">
        <table className="w-full mb-3">
          <tbody className="divide-y">
            {itemDetails.map((d) => (
              <tr key={d.item_id}>
                <td className="py-1">{d.user_name}</td>
                <td className="py-1 truncate max-w-xs">{d.product_name}</td>
                <td className="py-1 text-right">x{d.quantity}</td>
                <td className="py-1 text-right">
                  {(d.price_at_order * d.quantity).toLocaleString()}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">주문번호</label>
            <input
              type="text"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="외부 몰 주문번호"
              className="border rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-gray-500 block mb-1">배송비</label>
            <input
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
          >
            {saving ? '저장...' : '주문완료'}
          </button>
        </div>
      </div>
    </div>
  );
}

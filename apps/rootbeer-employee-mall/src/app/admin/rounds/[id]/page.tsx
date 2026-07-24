'use client';

import { useEffect, useState, use } from 'react';
import { STORE_LABELS } from '@/types';
import type { SettlementRow, Store } from '@/types';
import { SectionCard, Button, StatusBadge, EmptyState, fieldClass, tabItemClass } from '@/components/ui';
import { PURCHASE_STATUS, type StatusMeta } from '@/lib/status';
import { formatPrice, formatDate, formatDateTime } from '@/lib/format';

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
  product_option: string | null;
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

const STATUS_ACTION_CLASS =
  'text-xs text-white px-3.5 py-1.5 rounded-full font-medium transition-colors';

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

  if (loading || !data) return <div className="text-center py-12 text-ink-600">로딩 중...</div>;

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

  // 요약 스탯
  const distinctOrders = new Set(orders.map((o) => o.order_id)).size;
  const grandTotal = orders
    .filter((o) => o.item_status === 'active')
    .reduce((sum, o) => sum + o.price_at_order * o.quantity, 0);

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
          <h1 className="text-xl font-bold text-ink-900">
            {round.title || `라운드 #${round.id}`}
          </h1>
          <p className="text-xs text-ink-400">
            {formatDate(round.created_at)}
            {round.deadline && ` · 마감: ${formatDateTime(round.deadline)}`}
          </p>
        </div>
        <div className="flex gap-2">
          {round.status === 'open' && (
            <button
              onClick={() => handleStatusChange('closed')}
              className={`${STATUS_ACTION_CLASS} bg-ocher-500 hover:bg-ocher-600`}
            >
              마감
            </button>
          )}
          {round.status === 'closed' && (
            <button
              onClick={() => handleStatusChange('ordered')}
              className={`${STATUS_ACTION_CLASS} bg-clay-500 hover:bg-clay-600`}
            >
              주문완료 처리
            </button>
          )}
          {round.status === 'ordered' && (
            <button
              onClick={() => handleStatusChange('settled')}
              className={`${STATUS_ACTION_CLASS} bg-ink-900 hover:bg-ink-900/90`}
            >
              정산완료
            </button>
          )}
        </div>
      </div>

      {/* 요약 스탯 */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-paper-card border border-line rounded-lg shadow-soft px-3 py-2.5">
          <p className="text-[11px] text-ink-400">주문</p>
          <p className="text-base font-bold text-ink-900 tnum">{distinctOrders}건</p>
        </div>
        <div className="bg-paper-card border border-line rounded-lg shadow-soft px-3 py-2.5">
          <p className="text-[11px] text-ink-400">상품 항목</p>
          <p className="text-base font-bold text-ink-900 tnum">{orders.length}개</p>
        </div>
        <div className="bg-paper-card border border-line rounded-lg shadow-soft px-3 py-2.5">
          <p className="text-[11px] text-ink-400">총액</p>
          <p className="text-base font-bold text-ink-900 tnum">{formatPrice(grandTotal)}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4 border-b border-line">
        {[
          { key: 'orders' as Tab, label: `주문 (${orders.length})` },
          { key: 'purchases' as Tab, label: `구매 (${purchases.length})` },
          { key: 'settlement' as Tab, label: '정산표' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tabItemClass(tab === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-6">
          {isOpen && (
            <div className="bg-ocher-50 border border-ocher-500/20 rounded-lg p-3 text-sm text-ocher-600">
              라운드가 마감된 이후에 상품 배정 및 구매 생성이 가능합니다.
            </div>
          )}
          {(Object.entries(byStore) as [Store, OrderRow[]][]).map(([store, rows]) => {
            const storeTotal = rows.reduce((sum, r) => sum + r.price_at_order * r.quantity, 0);
            const unassigned = rows.filter((r) => !assignedItemIds.has(r.item_id));

            return (
              <div key={store}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-medium text-ink-900 tnum">
                    {STORE_LABELS[store]} · {formatPrice(storeTotal)}
                  </h2>
                  <div className="flex items-center gap-2">
                    {!isOpen && unassigned.length > 0 && (
                      <>
                        <button
                          onClick={() => selectAllForStore(store)}
                          className="text-xs text-clay-600 hover:text-clay-700"
                        >
                          미배정 전체선택
                        </button>
                        {selectedItems.size > 0 && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleItemStatus(
                              Array.from(selectedItems).filter((itemId) => {
                                const row = orders.find((o) => o.item_id === itemId);
                                return row?.product_store === store;
                              }),
                              'soldout',
                            )}
                          >
                            품절 처리
                          </Button>
                        )}
                        <Button variant="primary" size="sm" onClick={() => handleCreatePurchase(store)}>
                          구매 생성
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <SectionCard className="overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-line-soft text-left text-ink-600">
                      <tr>
                        <th className="p-2 w-8"></th>
                        <th className="p-2 font-medium">주문자</th>
                        <th className="p-2 font-medium">상품</th>
                        <th className="p-2 font-medium text-right">수량</th>
                        <th className="p-2 font-medium text-right">금액</th>
                        <th className="p-2 font-medium text-center">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rows.map((row) => {
                        const assigned = assignedItemIds.has(row.item_id);
                        const isSoldout = row.item_status === 'soldout';
                        return (
                          <tr
                            key={row.item_id}
                            className={
                              isSoldout ? 'bg-terra-50 opacity-60' : assigned ? 'bg-sage-50' : ''
                            }
                          >
                            <td className="p-2">
                              {!isOpen && !assigned && !isSoldout && (
                                <input
                                  type="checkbox"
                                  checked={selectedItems.has(row.item_id)}
                                  onChange={() => toggleItem(row.item_id)}
                                  className="accent-clay-500"
                                />
                              )}
                            </td>
                            <td className="p-2">
                              <p className="font-medium text-ink-900">{row.user_name}</p>
                              {row.delivery_location === 'custom' && (
                                <span className="text-xs text-ocher-600 block" title={`${row.custom_name} / ${row.custom_phone} / ${row.custom_address}`}>
                                  개별배송
                                </span>
                              )}
                            </td>
                            <td className="p-2">
                              <p className={`break-words ${isSoldout ? 'line-through text-ink-400' : 'text-ink-900'}`}>
                                {row.product_name}
                              </p>
                              <p className="text-xs text-ink-400">
                                {row.product_brand}
                                {row.product_option && ` · ${row.product_option}`}
                              </p>
                            </td>
                            <td className="p-2 text-right tnum">{row.quantity}</td>
                            <td className="p-2 text-right tnum">
                              {formatPrice(row.price_at_order * row.quantity)}
                            </td>
                            <td className="p-2 text-center">
                              {isSoldout ? (
                                <span className="flex items-center justify-center gap-1">
                                  <span className="text-xs text-terra-600 font-medium">품절</span>
                                  {!isOpen && (
                                    <button
                                      onClick={() => handleItemStatus([row.item_id], 'active')}
                                      className="text-xs text-clay-600 underline"
                                    >
                                      복구
                                    </button>
                                  )}
                                </span>
                              ) : assigned ? (
                                <span className="text-xs text-sage-600">배정됨</span>
                              ) : (
                                <span className="text-xs text-ink-400">미배정</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </SectionCard>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'purchases' && (
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <EmptyState title="생성된 구매가 없습니다" description="주문 탭에서 상품을 선택하여 구매를 생성하세요." />
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

              return (
                <PurchaseCard
                  key={purchase.id}
                  purchase={purchase}
                  itemDetails={itemDetails}
                  purchaseTotal={purchaseTotal}
                  statusMeta={PURCHASE_STATUS[purchase.status]}
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
            <EmptyState title="주문 데이터가 없습니다" />
          ) : (
            <SectionCard className="overflow-hidden">
              <table className="w-full text-sm tnum">
                <thead className="bg-line-soft text-left text-ink-600">
                  <tr>
                    <th className="p-3 font-medium">이름</th>
                    <th className="p-3 font-medium text-right">상품 합계</th>
                    <th className="p-3 font-medium text-right">배송비 분담</th>
                    <th className="p-3 font-medium text-right">정산 금액</th>
                    <th className="p-3 font-medium">정산 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {settlement.map((row) => (
                    <tr key={row.user_id}>
                      <td className="p-3">
                        <p className="font-medium text-ink-900">{row.user_name}</p>
                        <p className="text-xs text-ink-400">{row.user_email}</p>
                      </td>
                      <td className="p-3 text-right text-ink-600">{formatPrice(row.items_total)}</td>
                      <td className="p-3 text-right text-ink-600">{formatPrice(row.shipping_share)}</td>
                      <td className="p-3 text-right font-bold text-ink-900">{formatPrice(row.total)}</td>
                      <td className="p-3">
                        {row.settled ? (
                          <div>
                            <p className="text-sage-600 font-medium">✓ 입금 확인</p>
                            <p className="text-xs text-ink-400">
                              {row.settled_at && `${formatDate(row.settled_at)} · `}
                              {row.confirm_no}
                            </p>
                          </div>
                        ) : (
                          <span className="text-ink-400">미확인</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-line-soft font-bold text-ink-900">
                  <tr>
                    <td className="p-3">합계</td>
                    <td className="p-3 text-right">
                      {formatPrice(settlement.reduce((s, r) => s + r.items_total, 0))}
                    </td>
                    <td className="p-3 text-right">
                      {formatPrice(settlement.reduce((s, r) => s + r.shipping_share, 0))}
                    </td>
                    <td className="p-3 text-right">
                      {formatPrice(settlement.reduce((s, r) => s + r.total, 0))}
                    </td>
                    <td className="p-3 text-ink-600">
                      {settlement.filter((r) => r.settled).length}/{settlement.length} 확인
                    </td>
                  </tr>
                </tfoot>
              </table>
            </SectionCard>
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
  statusMeta,
  onUpdate,
}: {
  purchase: PurchaseData;
  itemDetails: OrderRow[];
  purchaseTotal: number;
  statusMeta: StatusMeta | undefined;
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
    <SectionCard>
      <div className="p-3 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-ink-900">
            {STORE_LABELS[purchase.store as keyof typeof STORE_LABELS]}
          </span>
          <StatusBadge status={statusMeta} />
          <span className="text-xs text-ink-400 tnum">
            {formatPrice(purchaseTotal)} · {itemDetails.length}개 항목
          </span>
        </div>
      </div>

      <div className="p-3 text-sm">
        {/* 배송지 정보 */}
        {(() => {
          const deliveries = new Map<string, { location: string; detail: string }>();
          for (const d of itemDetails) {
            const key = `${d.order_id}`;
            if (!deliveries.has(key)) {
              if (d.delivery_location === 'custom') {
                deliveries.set(key, {
                  location: '개별배송',
                  detail: `${d.custom_name} / ${d.custom_phone} / ${d.custom_address}`,
                });
              } else {
                deliveries.set(key, {
                  location: d.delivery_location === 'jeju' ? 'axz제주오피스' : 'axz판교오피스',
                  detail: '',
                });
              }
            }
          }
          return (
            <div className="mb-3 p-2 bg-line-soft rounded text-xs text-ink-600">
              <span className="font-medium text-ink-900">배송지: </span>
              {[...deliveries.values()].map((v, i) => (
                <span key={i}>
                  {i > 0 && ' / '}
                  {v.location}
                  {v.detail && <span className="text-ink-400"> ({v.detail})</span>}
                </span>
              ))}
            </div>
          );
        })()}

        <table className="w-full mb-3 tnum">
          <tbody className="divide-y divide-line">
            {itemDetails.map((d) => (
              <tr key={d.item_id}>
                <td className="py-1 text-ink-900">{d.user_name}</td>
                <td className="py-1 break-words text-ink-900">
                  {d.product_name}
                  {d.product_option && <span className="text-ink-400"> · {d.product_option}</span>}
                </td>
                <td className="py-1 text-right text-ink-600">x{d.quantity}</td>
                <td className="py-1 text-right text-ink-900">
                  {formatPrice(d.price_at_order * d.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-ink-600 block mb-1">주문번호</label>
            <input
              type="text"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="외부 몰 주문번호"
              className={fieldClass}
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-ink-600 block mb-1">배송비</label>
            <input
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className={fieldClass}
            />
          </div>
          <Button variant="accent" size="md" onClick={handleSave} disabled={saving}>
            {saving ? '저장...' : '주문완료'}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

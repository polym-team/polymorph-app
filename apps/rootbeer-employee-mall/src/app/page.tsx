'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { Product, OrderRound } from '@/types';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [openRounds, setOpenRounds] = useState<OrderRound[]>([]);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role === 'pending') return;

    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/rounds').then((r) => r.json()),
    ]).then(([prods, rounds]) => {
      setProducts(prods);
      setOpenRounds((rounds as OrderRound[]).filter((r) => r.status === 'open'));
      setLoading(false);
    });
  }, [status, session?.user?.role]);

  if (status === 'loading') return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">로그인이 필요합니다.</p>
      </div>
    );
  }

  if (session.user.role === 'pending') {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-6 inline-block">
          <h2 className="font-bold text-lg mb-2">승인 대기 중</h2>
          <p className="text-gray-600">관리자 승인 후 서비스를 이용할 수 있습니다.</p>
          <p className="text-sm text-gray-400 mt-2">{session.user.email}</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-12 text-gray-500">상품 불러오는 중...</div>;

  // 현재 마켓 필터에 해당하는 상품에서 브랜드 추출
  const storeProducts = storeFilter === 'all'
    ? products
    : products.filter((p) => p.store === storeFilter);
  const brands = [...new Set(storeProducts.filter((p) => p.brand).map((p) => p.brand!))].sort();

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  };

  const filtered = products.filter((p) => {
    if (storeFilter !== 'all' && p.store !== storeFilter) return false;
    if (selectedBrands.size > 0 && (!p.brand || !selectedBrands.has(p.brand))) return false;
    if (keyword && !p.name.includes(keyword)) return false;
    return true;
  });

  return (
    <div>
      {openRounds.length > 0 && (
        <div className="space-y-2 mb-4">
          {openRounds.map((round) => (
            <div
              key={round.id}
              className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between"
            >
              <span className="text-sm">
                <span className="font-medium">주문 접수중</span>
                {round.title && <span className="text-gray-600"> - {round.title}</span>}
                {round.deadline && (
                  <span className="text-gray-500 ml-2">
                    마감: {new Date(round.deadline).toLocaleString('ko-KR')}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {[
              { value: 'all', label: '전체' },
              { value: 'amoremall', label: '아모레몰' },
              { value: 'innisfree', label: '이니스프리' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setStoreFilter(opt.value);
                  setSelectedBrands(new Set());
                }}
                className={`px-3 py-1.5 text-sm rounded border ${
                  storeFilter === opt.value
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="상품명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm flex-1 min-w-[160px]"
          />
        </div>

        {brands.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => toggleBrand(brand)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  selectedBrands.has(brand)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {brand}
              </button>
            ))}
            {selectedBrands.size > 0 && (
              <button
                onClick={() => setSelectedBrands(new Set())}
                className="px-2.5 py-1 text-xs text-gray-400 hover:text-gray-600"
              >
                초기화
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-3">{filtered.length}개 상품</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">상품이 없습니다.</div>
      )}
    </div>
  );
}

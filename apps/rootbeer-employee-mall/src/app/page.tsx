'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const presetLoaded = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 필터 프리셋 저장 (디바운스 500ms)
  const savePreset = useCallback((store: string, brands: Set<string>, kw: string) => {
    if (!presetLoaded.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(() => {
      fetch('/api/users/filter-preset', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store,
          brands: Array.from(brands),
          keyword: kw,
        }),
      })
        .then(() => {
          setSaveStatus('saved');
          fadeTimerRef.current = setTimeout(() => setSaveStatus('idle'), 1500);
        })
        .catch(() => setSaveStatus('idle'));
    }, 500);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role === 'pending') return;

    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/rounds').then((r) => r.json()),
      fetch('/api/users/filter-preset').then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([prods, rounds, preset]) => {
      setProducts(prods);
      setOpenRounds((rounds as OrderRound[]).filter((r) => r.status === 'open'));
      if (preset) {
        if (preset.store) setStoreFilter(preset.store);
        if (preset.brands?.length) setSelectedBrands(new Set(preset.brands));
        if (preset.keyword) setKeyword(preset.keyword);
      }
      presetLoaded.current = true;
      setLoading(false);
    });
  }, [status, session?.user?.role]);

  if (status === 'loading') return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-500 to-mint-500 bg-clip-text text-transparent mb-2">
            임직원몰
          </h1>
          <p className="text-gray-400 mb-8">임직원 할인 공동구매 서비스</p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="bg-accent-500 text-white px-8 py-3 rounded-full hover:bg-accent-600 transition-colors text-sm font-semibold shadow-lg shadow-accent-500/25"
          >
            Google 계정으로 로그인
          </button>
        </div>
      </div>
    );
  }

  if (session.user.role === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-8 inline-block">
            <h2 className="font-bold text-lg mb-2 text-amber-700">승인 대기 중</h2>
            <p className="text-gray-500 text-sm">관리자 승인 후 서비스를 이용할 수 있습니다.</p>
            <p className="text-xs text-gray-400 mt-3">{session.user.email}</p>
          </div>
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
      savePreset(storeFilter, next, keyword);
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
      {/* 라운드 배너 - 얇은 띠 */}
      {openRounds.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {openRounds.map((round) => (
            <div
              key={round.id}
              className="bg-gradient-to-r from-accent-500/10 to-mint-500/10 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">
                <span className="font-semibold text-accent-600">접수중</span>
                {round.title && <span className="ml-1">{round.title}</span>}
                {round.deadline && (
                  <span className="text-gray-400 ml-1">
                    · 마감 {new Date(round.deadline).toLocaleString('ko-KR')}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 검색바 + 필터 */}
      <div className="mb-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="상품 검색..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                savePreset(storeFilter, selectedBrands, e.target.value);
              }}
              className="w-full bg-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30 shadow-sm border border-gray-100 placeholder-gray-400 transition-all"
            />
          </div>
          <span
            className={`text-[11px] whitespace-nowrap transition-opacity duration-300 ${
              saveStatus === 'idle'
                ? 'opacity-0'
                : saveStatus === 'saving'
                  ? 'opacity-100 text-gray-400'
                  : 'opacity-100 text-mint-500'
            }`}
          >
            {saveStatus === 'saving' ? '저장 중...' : '저장됨'}
          </span>
        </div>

        {/* 마켓 + 브랜드 수평 스크롤 한 줄 */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-hide">
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
                savePreset(opt.value, new Set(), keyword);
              }}
              className={`flex-shrink-0 px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                storeFilter === opt.value
                  ? 'bg-accent-500 text-white font-medium shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-accent-500/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
          {brands.length > 1 && (
            <>
              <span className="w-px bg-gray-200 flex-shrink-0 my-0.5" />
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`flex-shrink-0 px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                    selectedBrands.has(brand)
                      ? 'bg-accent-500 text-white font-medium shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-accent-500/40'
                  }`}
                >
                  {brand}
                </button>
              ))}
              {selectedBrands.size > 0 && (
                <button
                  onClick={() => {
                    setSelectedBrands(new Set());
                    savePreset(storeFilter, new Set(), keyword);
                  }}
                  className="flex-shrink-0 px-2 py-1 text-[11px] text-gray-400 hover:text-gray-600"
                >
                  초기화
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 상품 수 */}
      <p className="text-[11px] text-gray-400 mb-2 mt-1">{filtered.length}개 상품</p>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-300">
          <p className="text-lg mb-1">상품이 없습니다</p>
          <p className="text-sm">다른 필터를 시도해보세요</p>
        </div>
      )}
    </div>
  );
}

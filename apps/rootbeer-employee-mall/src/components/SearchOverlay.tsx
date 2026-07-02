'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from './UiStore';
import { useCatalogStore } from './CatalogStore';
import { savePreset } from '@/lib/preset';

export function SearchOverlay() {
  const router = useRouter();
  const open = useUiStore((s) => s.searchOpen);
  const closeSearch = useUiStore((s) => s.closeSearch);
  const { products, keyword, setKeyword, selectedBrands, setSelectedBrands, storeFilter } = useCatalogStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(t);
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeSearch]);

  const brands = [...new Set(products.filter((p) => p.brand).map((p) => p.brand!))].sort().slice(0, 30);

  const applyAndClose = () => {
    closeSearch();
    router.push('/');
  };

  const onKeyword = (v: string) => {
    setKeyword(v);
    savePreset(storeFilter, selectedBrands, v);
  };

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(next);
    savePreset(storeFilter, next, keyword);
  };

  return (
    <div
      className={`fixed inset-0 z-[70] bg-paper flex flex-col transition-all duration-200 ${
        open ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2 pointer-events-none'
      }`}
    >
      <div className="max-w-5xl w-full mx-auto flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <div className="flex-1 flex items-center gap-2 bg-paper-card border border-line rounded-full px-4 py-3 shadow-soft">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A79E96" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7.5" /><line x1="21" y1="21" x2="16.8" y2="16.8" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => onKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyAndClose()}
              placeholder="상품, 브랜드 검색"
              className="w-full bg-transparent outline-none text-[15px] text-ink-900 placeholder-ink-400"
            />
            {keyword && (
              <button onClick={() => onKeyword('')} className="text-ink-400 text-sm" aria-label="지우기">✕</button>
            )}
          </div>
          <button onClick={closeSearch} className="text-sm text-ink-600 px-2 py-2">닫기</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {brands.length > 0 && (
            <>
              <p className="text-[13px] italic text-clay-600 mt-3 mb-2.5" style={{ fontFamily: 'Georgia, serif' }}>
                브랜드로 찾기
              </p>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`text-[13px] rounded-full px-3.5 py-2 border transition-colors ${
                      selectedBrands.includes(brand)
                        ? 'bg-clay-500 text-white border-clay-500 font-medium'
                        : 'bg-paper-card text-ink-600 border-line hover:border-clay-500/50 hover:text-ink-900'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </>
          )}

          {(keyword || selectedBrands.length > 0) && (
            <button
              onClick={applyAndClose}
              className="w-full mt-7 bg-ink-900 text-paper text-sm font-semibold py-3.5 rounded-full hover:bg-clay-600 transition-colors"
            >
              결과 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

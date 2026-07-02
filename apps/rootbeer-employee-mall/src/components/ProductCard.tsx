'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Product } from '@/types';
import { STORE_LABELS } from '@/types';
import { useCartStore } from './CartStore';
import { useCatalogStore } from './CatalogStore';
import { Price } from '@/components/ui';

interface ProductWithDetail extends Product {
  hasDetail?: boolean;
  hasOptions?: boolean;
}

const ASPECT: Record<'square' | 'tall', string> = {
  square: 'aspect-square',
  tall: 'aspect-[3/4]',
};

export function ProductCard({
  product,
  aspect = 'square',
}: {
  product: ProductWithDetail;
  aspect?: 'square' | 'tall';
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const setListScrollY = useCatalogStore((s) => s.setListScrollY);
  const [added, setAdded] = useState(false);

  const discountText =
    product.discountRate && product.discountRate > 0 ? `${product.discountRate}%` : null;

  const goToDetail = () => {
    setListScrollY(window.scrollY);
    router.push(`/products/${product.id}`);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.soldOut) return;
    // 옵션 있는 상품은 선택이 필요하므로 상세로 이동
    if (product.hasOptions) {
      goToDetail();
      return;
    }
    addItem({
      productId: product.id,
      optionId: null,
      optionName: null,
      name: product.name,
      brand: product.brand,
      price: product.salePrice,
      store: product.store,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group">
      {/* 이미지 — 라운딩만, 박스/그림자 없음 */}
      <div
        className={`${ASPECT[aspect]} relative bg-line-soft rounded-lg overflow-hidden cursor-pointer`}
        onClick={goToDetail}
      >
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        )}

        {product.soldOut && (
          <div className="absolute inset-0 bg-ink-900/35 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-white text-sm font-medium">품절</span>
          </div>
        )}

        {discountText && !product.soldOut && (
          <span className="absolute top-2.5 left-2.5 bg-terra-500/95 text-white text-[10.5px] font-bold tracking-tight px-1.5 py-0.5 rounded backdrop-blur-sm tnum">
            {discountText}
          </span>
        )}

        {/* 담기 — 이미지 우하단 고정 (텍스트 길이와 무관, 줄바꿈 없음) */}
        {!product.soldOut && (
          <button
            onClick={handleAdd}
            aria-label={product.hasOptions ? '옵션 선택' : '장바구니 담기'}
            className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 active:scale-90 ${
              added ? 'bg-sage-500 text-white' : 'bg-paper/90 text-ink-900 backdrop-blur hover:bg-ink-900 hover:text-paper'
            }`}
          >
            {added ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : product.hasOptions ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="8" x2="20" y2="8" /><circle cx="15" cy="8" r="2.4" fill="currentColor" stroke="none" /><line x1="4" y1="16" x2="20" y2="16" /><circle cx="9" cy="16" r="2.4" fill="currentColor" stroke="none" /></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            )}
          </button>
        )}
      </div>

      {/* 정보 — 투명 배경 위 세로 스택 */}
      <div className="pt-2.5">
        <p className="text-[11px] text-ink-400 truncate">
          {STORE_LABELS[product.store]}
          {product.brand && ` · ${product.brand}`}
        </p>
        <h3
          className="text-[13px] leading-snug text-ink-900 line-clamp-2 mt-1 mb-1.5 cursor-pointer group-hover:text-clay-600 transition-colors"
          onClick={goToDetail}
        >
          {product.name}
        </h3>
        <Price sale={product.salePrice} origin={product.originPrice} size="sm" />
      </div>
    </div>
  );
}

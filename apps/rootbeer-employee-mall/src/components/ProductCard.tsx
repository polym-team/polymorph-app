'use client';

import { useRef } from 'react';
import Image from 'next/image';
import type { Product } from '@/types';
import { STORE_LABELS } from '@/types';
import { useCartStore } from './CartStore';
import { useProductDetailModal } from './ProductStore';

interface ProductWithDetail extends Product {
  hasDetail?: boolean;
}

export function ProductCard({ product }: { product: ProductWithDetail }) {
  const addItem = useCartStore((s) => s.addItem);
  const openDetail = useProductDetailModal((s) => s.open);
  const cardRef = useRef<HTMLDivElement>(null);

  const discountText =
    product.discountRate && product.discountRate > 0 ? `${product.discountRate}%` : null;

  const handleOpenDetail = () => {
    if (!product.hasDetail || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    openDetail(product.id, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div
        className={`aspect-square bg-gray-50 relative ${product.hasDetail ? 'cursor-pointer' : ''}`}
        onClick={handleOpenDetail}
      >
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
            className="object-cover"
          />
        )}
        {product.soldOut && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-full">품절</span>
          </div>
        )}
        {product.hasDetail && !product.soldOut && (
          <span className="absolute top-2 right-2 bg-accent-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
            상세보기
          </span>
        )}
        {discountText && !product.soldOut && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {discountText}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <span className="text-[11px] text-gray-400 mb-0.5">
          {STORE_LABELS[product.store]}
          {product.brand && ` · ${product.brand}`}
        </span>
        <h3
          className={`text-[13px] leading-snug font-medium line-clamp-2 mb-2 ${product.hasDetail ? 'cursor-pointer hover:text-accent-500 transition-colors' : ''}`}
          onClick={handleOpenDetail}
        >
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="font-bold text-[15px]">{product.salePrice.toLocaleString()}</span>
            <span className="text-xs text-gray-500">원</span>
            {product.originPrice && product.originPrice !== product.salePrice && (
              <span className="text-[11px] text-gray-300 line-through ml-1.5">
                {product.originPrice.toLocaleString()}
              </span>
            )}
          </div>
          <button
            disabled={product.soldOut}
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                brand: product.brand,
                price: product.salePrice,
                store: product.store,
                imageUrl: product.imageUrl,
              })
            }
            className="text-xs px-3 py-1.5 bg-accent-500 text-white rounded-full hover:bg-accent-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            담기
          </button>
        </div>
      </div>
    </div>
  );
}

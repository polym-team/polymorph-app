'use client';

import Link from 'next/link';
import type { Product } from '@/types';
import { STORE_LABELS } from '@/types';
import { useCartStore } from './CartStore';

interface ProductWithDetail extends Product {
  hasDetail?: boolean;
}

export function ProductCard({ product }: { product: ProductWithDetail }) {
  const addItem = useCartStore((s) => s.addItem);

  const discountText =
    product.discountRate && product.discountRate > 0 ? `${product.discountRate}%` : null;

  const imageContent = (
    <div className="aspect-square bg-gray-100 relative">
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      )}
      {product.soldOut && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white font-bold text-lg">품절</span>
        </div>
      )}
      {product.hasDetail && (
        <span className="absolute top-1.5 right-1.5 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">
          상세
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded border overflow-hidden flex flex-col">
      {product.hasDetail ? (
        <Link href={`/products/${product.id}`}>{imageContent}</Link>
      ) : (
        imageContent
      )}
      <div className="p-3 flex flex-col flex-1">
        {product.brand && (
          <span className="text-xs text-gray-500 mb-1">{product.brand}</span>
        )}
        {product.hasDetail ? (
          <Link href={`/products/${product.id}`} className="hover:underline">
            <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
          </Link>
        ) : (
          <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
        )}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            {discountText && (
              <span className="text-red-500 font-bold text-sm">{discountText}</span>
            )}
            <span className="font-bold">{product.salePrice.toLocaleString()}원</span>
          </div>
          {product.originPrice && product.originPrice !== product.salePrice && (
            <span className="text-xs text-gray-400 line-through">
              {product.originPrice.toLocaleString()}원
            </span>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {STORE_LABELS[product.store]}
            </span>
            <button
              disabled={product.soldOut}
              onClick={(e) => {
                e.preventDefault();
                addItem({
                  productId: product.id,
                  name: product.name,
                  brand: product.brand,
                  price: product.salePrice,
                  store: product.store,
                  imageUrl: product.imageUrl,
                });
              }}
              className="text-xs px-3 py-1 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              담기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

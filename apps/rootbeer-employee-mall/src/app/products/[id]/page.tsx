'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/components/CartStore';
import { STORE_LABELS } from '@/types';
import type { Product } from '@/types';

interface ProductWithDetail extends Product {
  detail: {
    description: string | null;
    images: string[];
    htmlContent: string | null;
    scrapedAt: string;
  } | null;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<ProductWithDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.imageUrl);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (!session) return null;
  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;
  if (!product) return <div className="text-center py-12 text-gray-400">상품을 찾을 수 없습니다.</div>;

  const images = product.detail?.images ?? [];
  const allImages = product.imageUrl
    ? [product.imageUrl, ...images.filter((img) => img !== product.imageUrl)]
    : images;

  const handleAddToCart = () => {
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
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.push('/')} className="text-sm text-gray-500 mb-4 hover:text-gray-700">
        ← 목록으로
      </button>

      <div className="bg-white rounded border overflow-hidden">
        {/* 이미지 영역 */}
        <div className="aspect-square bg-gray-100 relative">
          {selectedImage && (
            <img src={selectedImage} alt={product.name} className="w-full h-full object-contain" />
          )}
          {product.soldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">품절</span>
            </div>
          )}
        </div>

        {/* 썸네일 */}
        {allImages.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 rounded border flex-shrink-0 overflow-hidden ${
                  selectedImage === img ? 'border-black' : 'border-gray-200'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* 상품 정보 */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">{STORE_LABELS[product.store]}</span>
            {product.brand && <span className="text-xs text-gray-400">· {product.brand}</span>}
          </div>

          <h1 className="text-lg font-bold mb-3">{product.name}</h1>

          <div className="flex items-baseline gap-2 mb-1">
            {product.discountRate && product.discountRate > 0 && (
              <span className="text-red-500 font-bold text-lg">{product.discountRate}%</span>
            )}
            <span className="text-xl font-bold">{product.salePrice.toLocaleString()}원</span>
          </div>
          {product.originPrice && product.originPrice !== product.salePrice && (
            <p className="text-sm text-gray-400 line-through mb-4">
              {product.originPrice.toLocaleString()}원
            </p>
          )}

          {/* 상품 설명 */}
          {product.detail?.description && (
            <div className="border-t pt-4 mt-4">
              <h2 className="text-sm font-medium mb-2">상품 설명</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {product.detail.description}
              </p>
            </div>
          )}

          {/* 상품 상세 HTML */}
          {product.detail?.htmlContent && (
            <div className="border-t pt-4 mt-4">
              <h2 className="text-sm font-medium mb-3">상품 상세</h2>
              <div
                className="product-detail-html text-sm overflow-hidden"
                dangerouslySetInnerHTML={{ __html: product.detail.htmlContent }}
              />
            </div>
          )}

          {/* 담기 버튼 */}
          <button
            onClick={handleAddToCart}
            disabled={product.soldOut}
            className="w-full mt-6 bg-black text-white py-3 rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            {product.soldOut ? '품절' : '장바구니 담기'}
          </button>
        </div>
      </div>
    </div>
  );
}

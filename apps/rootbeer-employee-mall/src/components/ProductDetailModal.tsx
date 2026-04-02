'use client';

import { useEffect, useState, useRef } from 'react';
import { useProductDetailModal } from './ProductStore';
import { useCartStore } from './CartStore';
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

const MAX_WIDTH = 480;

export function ProductDetailModal() {
  const { productId, cardRect, close } = useProductDetailModal();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<ProductWithDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'closed' | 'expanding' | 'open' | 'collapsing'>('closed');
  const modalRef = useRef<HTMLDivElement>(null);

  // popstate로 뒤로가기 감지
  useEffect(() => {
    const handlePopState = () => {
      if (phase === 'open' || phase === 'expanding') {
        setPhase('collapsing');
        setTimeout(() => {
          close();
          setPhase('closed');
        }, 300);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [close, phase]);

  // 모달 열릴 때
  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setSelectedImage(null);
      return;
    }

    document.body.style.overflow = 'hidden';
    setPhase('expanding');
    setLoading(true);

    // 약간의 딜레이 후 open 상태로 전환 (애니메이션 트리거)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('open');
      });
    });

    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.imageUrl);
        setLoading(false);
      });

    return () => {
      document.body.style.overflow = '';
    };
  }, [productId]);

  if (!productId && phase === 'closed') return null;

  const handleClose = () => {
    window.history.back();
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.salePrice,
      store: product.store,
      imageUrl: product.imageUrl,
    });
  };

  const allImages = product
    ? product.detail?.images?.length
      ? [product.imageUrl, ...product.detail.images.filter((img) => img !== product.imageUrl)].filter(Boolean) as string[]
      : product.imageUrl ? [product.imageUrl] : []
    : [];

  // 목표 위치 계산 (화면 중앙, max-width 적용)
  const vw = typeof window !== 'undefined' ? window.innerWidth : 480;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const modalWidth = Math.min(vw, MAX_WIDTH);
  const targetLeft = (vw - modalWidth) / 2;
  const targetTop = 0;

  // 카드 위치에서 시작 → 목표 위치로 확장
  const isExpanded = phase === 'open';
  const isVisible = phase !== 'closed';

  const startRect = cardRect ?? { top: vh / 2, left: vw / 2, width: 0, height: 0 };

  const modalStyle: React.CSSProperties = isExpanded
    ? {
        top: targetTop,
        left: targetLeft,
        width: modalWidth,
        height: vh,
        borderRadius: vw <= MAX_WIDTH ? 0 : 12,
        opacity: 1,
      }
    : {
        top: startRect.top,
        left: startRect.left,
        width: startRect.width,
        height: startRect.height,
        borderRadius: 8,
        opacity: phase === 'collapsing' ? 0 : 1,
      };

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isExpanded ? 'bg-black/50' : 'bg-transparent pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && isExpanded) handleClose();
      }}
      style={{ display: isVisible ? undefined : 'none' }}
    >
      <div
        ref={modalRef}
        className="fixed bg-white overflow-hidden shadow-2xl"
        style={{
          ...modalStyle,
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: isExpanded ? 'auto' : 'hidden',
          pointerEvents: isExpanded ? 'auto' : 'none',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className={`sticky top-3 float-right mr-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:text-black shadow transition-opacity duration-200 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          ✕
        </button>

        {loading || !product ? (
          <div className={`py-24 text-center text-gray-400 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            로딩 중...
          </div>
        ) : (
          <div className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {/* Image */}
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

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded border flex-shrink-0 overflow-hidden ${
                      selectedImage === img ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
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

              {product.detail?.description && (
                <div className="border-t pt-4 mt-4">
                  <h2 className="text-sm font-medium mb-2">상품 설명</h2>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {product.detail.description}
                  </p>
                </div>
              )}

              {product.detail?.htmlContent && (
                <div className="border-t pt-4 mt-4">
                  <h2 className="text-sm font-medium mb-3">상품 상세</h2>
                  <div
                    className="product-detail-html text-sm overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: product.detail.htmlContent }}
                  />
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.soldOut}
                className="w-full mt-6 mb-8 bg-black text-white py-3 rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                {product.soldOut ? '품절' : '장바구니 담기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
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

  const isMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad/i.test(navigator.userAgent);
  }, []);

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
        className="fixed bg-white overflow-hidden shadow-2xl rounded-2xl sm:rounded-2xl"
        style={{
          ...modalStyle,
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: isExpanded ? 'auto' : 'hidden',
          pointerEvents: isExpanded ? 'auto' : 'none',
        }}
      >
        {/* Top close button */}
        <div className={`sticky top-0 z-10 flex justify-end px-3 py-2 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 bg-white/70 backdrop-blur-md rounded-full hover:bg-white hover:text-black shadow-sm transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading || !product ? (
          <div className={`py-24 text-center text-gray-400 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            로딩 중...
          </div>
        ) : (
          <div className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {/* Image */}
            <div className="aspect-square bg-gray-50 relative">
              {selectedImage && (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-contain" />
              )}
              {product.soldOut && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-white font-bold bg-black/40 px-4 py-2 rounded-full">품절</span>
                </div>
              )}
              {product.discountRate && product.discountRate > 0 && !product.soldOut && (
                <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {product.discountRate}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden transition-all duration-150 ${
                      selectedImage === img ? 'ring-2 ring-accent-500 scale-105' : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="px-4 pb-4">
              <span className="text-[11px] text-gray-400">
                {STORE_LABELS[product.store]}
                {product.brand && ` · ${product.brand}`}
              </span>

              <h1 className="text-lg font-bold mt-1 mb-3 leading-snug">{product.name}</h1>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold">{product.salePrice.toLocaleString()}</span>
                <span className="text-sm text-gray-500">원</span>
              </div>
              {product.originPrice && product.originPrice !== product.salePrice && (
                <p className="text-sm text-gray-300 line-through mb-4">
                  {product.originPrice.toLocaleString()}원
                </p>
              )}

              {product.detail?.description && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h2 className="text-sm font-semibold mb-2 text-gray-700">상품 설명</h2>
                  <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">
                    {product.detail.description}
                  </p>
                </div>
              )}

              {product.detail?.htmlContent && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h2 className="text-sm font-semibold mb-3 text-gray-700">상품 상세</h2>
                  <div
                    className="product-detail-html text-sm overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: product.detail.htmlContent }}
                  />
                </div>
              )}

              {/* spacer for fixed bottom button */}
              <div className="h-20" />
            </div>

            {/* Fixed bottom action */}
            <div className={`sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex gap-2 items-center">
                {isMobile && (
                  <button
                    onClick={handleClose}
                    className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleAddToCart}
                  disabled={product.soldOut}
                  className="flex-1 bg-accent-500 text-white py-3 rounded-xl hover:bg-accent-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
                >
                  {product.soldOut ? '품절' : '장바구니 담기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

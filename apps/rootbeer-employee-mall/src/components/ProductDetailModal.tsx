'use client';

import { useEffect, useState, useRef } from 'react';
import { useProductDetailModal } from './ProductStore';
import { STORE_LABELS } from '@/types';
import type { Product } from '@/types';

interface ProductOption {
  id: number;
  name: string;
  stock: number;
  soldOut: boolean;
}

interface ProductWithDetail extends Product {
  detail: {
    description: string | null;
    images: string[];
    htmlContent: string | null;
    scrapedAt: string;
  } | null;
  options?: ProductOption[];
}

const MAX_WIDTH = 480;

export function ProductDetailModal() {
  const { productId, cardRect, previewProduct, startClose, close, setOptions, selectOption, selectedOption } = useProductDetailModal();
  const [product, setProduct] = useState<ProductWithDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detailLoaded, setDetailLoaded] = useState(false);
  const [phase, setPhase] = useState<'closed' | 'expanding' | 'open' | 'collapsing'>('closed');
  const modalRef = useRef<HTMLDivElement>(null);

  // popstate로 뒤로가기 감지
  useEffect(() => {
    const handlePopState = () => {
      if (phase === 'open' || phase === 'expanding') {
        startClose();
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
      setDetailLoaded(false);
      return;
    }

    document.body.style.overflow = 'hidden';
    setPhase('expanding');
    setDetailLoaded(false);

    // preview 이미지를 즉시 표시
    if (previewProduct?.imageUrl) {
      setSelectedImage(previewProduct.imageUrl);
    }

    // 약간의 딜레이 후 open 상태로 전환 (애니메이션 트리거)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('open');
      });
    });

    fetch(`/api/products/${productId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.imageUrl);
        if (data.options?.length > 0) {
          setOptions(data.options);
        }
        setDetailLoaded(true);
      })
      .catch(() => setDetailLoaded(true));

    return () => {
      document.body.style.overflow = '';
    };
  }, [productId]);

  if (!productId && phase === 'closed') return null;

  const handleClose = () => {
    window.history.back();
  };

  // preview 또는 상세 데이터에서 표시할 정보 결정
  const displayProduct = product ?? previewProduct;

  const allImages = product
    ? product.detail?.images?.length
      ? [product.imageUrl, ...product.detail.images.filter((img) => img !== product.imageUrl)].filter(Boolean) as string[]
      : product.imageUrl ? [product.imageUrl] : []
    : previewProduct?.imageUrl ? [previewProduct.imageUrl] : [];

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
        {/* Top close button — 이미지 위에 오버레이 (레이아웃 공간 차지 안 함) */}
        <div className={`sticky top-0 z-10 flex justify-end px-3 py-2 -mb-12 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 bg-white/70 backdrop-blur-md rounded-full hover:bg-white hover:text-black shadow-sm transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {displayProduct ? (
          <div>
            {/* Image — 확장 시작부터 항상 표시 (카드→모달 연결감) */}
            <div className="aspect-square bg-gray-50 relative">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt={displayProduct.name}
                  className="w-full h-full transition-[object-fit] duration-300"
                  style={{ objectFit: isExpanded ? 'contain' : 'cover' }}
                />
              )}
              {displayProduct.soldOut && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-white font-bold bg-black/40 px-4 py-2 rounded-full">품절</span>
                </div>
              )}
              {displayProduct.discountRate && displayProduct.discountRate > 0 && !displayProduct.soldOut && (
                <span className={`absolute bottom-3 left-3 bg-rose-500 text-white text-sm font-bold px-3 py-1 rounded-full transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                  {displayProduct.discountRate}% OFF
                </span>
              )}
            </div>

            {/* 이하 콘텐츠 — 확장 완료 후 페이드인 */}
            <div className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
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
                  {STORE_LABELS[displayProduct.store]}
                  {displayProduct.brand && ` · ${displayProduct.brand}`}
                </span>

                <h1 className="text-lg font-bold mt-1 mb-3 leading-snug">{displayProduct.name}</h1>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold">{displayProduct.salePrice.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">원</span>
                </div>
                {displayProduct.originPrice && displayProduct.originPrice !== displayProduct.salePrice && (
                  <p className="text-sm text-gray-300 line-through mb-4">
                    {displayProduct.originPrice.toLocaleString()}원
                  </p>
                )}

                {/* 옵션 선택 */}
                {detailLoaded && product?.options && product.options.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h2 className="text-sm font-semibold mb-2 text-gray-700">옵션 선택</h2>
                    <div className="flex flex-col gap-1.5">
                      {product.options.map((opt) => (
                        <button
                          key={opt.id}
                          disabled={opt.soldOut}
                          onClick={() => selectOption(selectedOption?.id === opt.id ? null : opt)}
                          className={`text-left px-3 py-2.5 rounded-xl text-sm transition-all border ${
                            selectedOption?.id === opt.id
                              ? 'border-accent-500 bg-accent-50 text-accent-700 font-medium'
                              : opt.soldOut
                                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                : 'border-gray-200 text-gray-600 hover:border-accent-300'
                          }`}
                        >
                          <span>{opt.name}</span>
                          {opt.soldOut && <span className="ml-2 text-xs text-gray-300">품절</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 상세 정보: 로딩 중이면 skeleton, 완료되면 실제 내용 */}
                {!detailLoaded ? (
                  <div className="border-t border-gray-100 pt-4 mt-4 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-20 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                      <div className="h-3 bg-gray-100 rounded w-4/6" />
                    </div>
                  </div>
                ) : (
                  <>
                    {product?.detail?.description && (
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h2 className="text-sm font-semibold mb-2 text-gray-700">상품 설명</h2>
                        <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">
                          {product.detail.description}
                        </p>
                      </div>
                    )}

                    {product?.detail?.htmlContent && (
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h2 className="text-sm font-semibold mb-3 text-gray-700">상품 상세</h2>
                        <div
                          className="product-detail-html text-sm overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: product.detail.htmlContent }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* spacer for bottom island nav */}
                <div className="h-24" />
              </div>
            </div>
          </div>
        ) : (
          <div className={`py-24 text-center text-gray-400 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            로딩 중...
          </div>
        )}
      </div>
    </div>
  );
}

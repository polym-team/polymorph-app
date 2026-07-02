'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/components/CartStore';
import { STORE_LABELS } from '@/types';
import type { Product } from '@/types';
import { Button, SectionCard, Price } from '@/components/ui';
import { formatPrice } from '@/lib/format';

interface ProductOption {
  id: number;
  name: string;
  salePrice: number | null;
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

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<ProductWithDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [added, setAdded] = useState(false);
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
  if (loading) return <div className="text-center py-12 text-ink-600">로딩 중...</div>;
  if (!product) return <div className="text-center py-12 text-ink-400">상품을 찾을 수 없습니다.</div>;

  const images = product.detail?.images ?? [];
  const allImages = product.imageUrl
    ? [product.imageUrl, ...images.filter((img) => img !== product.imageUrl)]
    : images;

  const options = product.options ?? [];
  const hasOptions = options.length > 0;
  const needsOption = hasOptions && !selectedOption;
  const disabled = product.soldOut || needsOption;
  const currentPrice = selectedOption?.salePrice ?? product.salePrice;

  const handleAddToCart = () => {
    if (disabled) return;
    addItem({
      productId: product.id,
      optionId: selectedOption?.id ?? null,
      optionName: selectedOption?.name ?? null,
      name: product.name,
      brand: product.brand,
      price: currentPrice,
      store: product.store,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  let ctaText = '장바구니 담기';
  if (product.soldOut) ctaText = '품절';
  else if (needsOption) ctaText = '옵션을 선택해주세요';
  else if (added) ctaText = '담겼습니다';

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-sm text-ink-400 mb-4 hover:text-ink-600 transition-colors"
      >
        ← 목록으로
      </button>

      <div className="sm:flex sm:gap-6 sm:items-start">
        {/* 이미지 갤러리 */}
        <div className="sm:w-1/2 sm:flex-shrink-0">
          <SectionCard className="overflow-hidden">
            <div className="aspect-square bg-line-soft relative">
              {selectedImage && (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-contain" />
              )}
              {product.soldOut && (
                <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-white font-medium text-2xl">품절</span>
                </div>
              )}
              {product.discountRate && product.discountRate > 0 && !product.soldOut && (
                <span className="absolute bottom-3 left-3 bg-terra-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {product.discountRate}% OFF
                </span>
              )}
            </div>
          </SectionCard>
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden transition-all ${
                    selectedImage === img ? 'ring-2 ring-clay-500' : 'ring-1 ring-line opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="mt-5 sm:mt-0 sm:flex-1 sm:min-w-0">
          <p className="text-xs text-ink-400">
            {STORE_LABELS[product.store]}
            {product.brand && ` · ${product.brand}`}
          </p>
          <h1 className="text-xl font-bold text-ink-900 mt-1 mb-3 leading-snug">{product.name}</h1>

          <Price sale={currentPrice} origin={product.originPrice} size="lg" />

          {/* 옵션 선택 */}
          {hasOptions && (
            <div className="border-t border-line pt-4 mt-4">
              <h2 className="text-sm font-semibold text-ink-900 mb-2">옵션 선택</h2>
              <div className="flex flex-col gap-1.5">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={opt.soldOut}
                    onClick={() => setSelectedOption(selectedOption?.id === opt.id ? null : opt)}
                    className={`text-left px-3 py-2.5 rounded-xl text-sm transition-all border flex items-center justify-between ${
                      selectedOption?.id === opt.id
                        ? 'border-clay-500 bg-clay-50 text-clay-600 font-medium'
                        : opt.soldOut
                          ? 'border-line bg-line-soft text-ink-400 cursor-not-allowed'
                          : 'border-line text-ink-600 hover:border-clay-500/50'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {opt.soldOut
                      ? <span className="ml-2 text-xs text-ink-400">품절</span>
                      : opt.salePrice != null && <span className="ml-2 text-xs font-medium tnum">{formatPrice(opt.salePrice)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            variant={added ? 'accent' : 'primary'}
            size="lg"
            onClick={handleAddToCart}
            disabled={disabled}
            className="w-full mt-5"
          >
            {ctaText}
          </Button>
        </div>
      </div>

      {/* 상품 설명 / 상세 */}
      {(product.detail?.description || product.detail?.htmlContent) && (
        <SectionCard className="p-4 mt-6">
          {product.detail?.description && (
            <div>
              <h2 className="text-sm font-semibold text-ink-900 mb-2">상품 설명</h2>
              <p className="text-sm text-ink-600 whitespace-pre-line leading-relaxed">
                {product.detail.description}
              </p>
            </div>
          )}
          {product.detail?.htmlContent && (
            <div className={product.detail?.description ? 'border-t border-line pt-4 mt-4' : ''}>
              <h2 className="text-sm font-semibold text-ink-900 mb-3">상품 상세</h2>
              <div
                className="product-detail-html text-sm overflow-hidden"
                dangerouslySetInnerHTML={{ __html: product.detail.htmlContent }}
              />
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

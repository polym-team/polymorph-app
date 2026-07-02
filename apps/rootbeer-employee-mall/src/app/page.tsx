'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useLayoutEffect } from 'react';
import type { Product, OrderRound, Notice } from '@/types';
import { STORE_LABELS } from '@/types';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { useCatalogStore } from '@/components/CatalogStore';
import { Button, EmptyState, Price } from '@/components/ui';
import { savePreset } from '@/lib/preset';
import { formatDate, formatDateTime } from '@/lib/format';

const STORE_TABS: { value: string; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'amoremall', label: '아모레몰' },
  { value: 'innisfree', label: '이니스프리' },
];

function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="-mx-4 -mt-4 mb-5 h-52 bg-line-soft" />
      <div className="h-4 bg-line rounded w-24 mb-3" />
      <div className="flex gap-3 mb-5 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-40 flex-shrink-0">
            <div className="aspect-square bg-line-soft rounded-xl mb-2" />
            <div className="h-3 bg-line-soft rounded w-3/4" />
          </div>
        ))}
      </div>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="break-inside-avoid mb-3">
            <div className={`${i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-square'} bg-line-soft rounded-lg`} />
            <div className="pt-2.5 space-y-2">
              <div className="h-2.5 bg-line-soft rounded w-16" />
              <div className="h-4 bg-line-soft rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 진행중 공동구매 — 풀블리드 히어로 */
function HeroRound({ round }: { round: OrderRound }) {
  let dday: string | null = null;
  if (round.deadline) {
    const days = Math.ceil((new Date(round.deadline).getTime() - Date.now()) / 86400000);
    if (days >= 0) dday = days === 0 ? 'D-DAY' : `D-${days}`;
  }
  return (
    <div
      className="relative -mx-4 -mt-4 mb-5 px-6 pt-8 pb-7 min-h-[210px] flex flex-col justify-end text-white overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(43,39,36,0) 28%, rgba(43,39,36,.62) 100%), radial-gradient(120% 90% at 78% 12%, #C9A79A 0%, #A2745F 42%, #6F5348 100%)',
      }}
    >
      <span className="self-start inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide bg-white/15 border border-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full mb-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        진행중 공동구매 · 접수중
      </span>
      {dday && (
        <span className="absolute top-6 right-6 bg-ink-900 text-paper text-xs font-bold px-3 py-1.5 rounded-full tnum">
          {dday}
        </span>
      )}
      <p className="text-[13px] italic opacity-90 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
        This week&apos;s group buy
      </p>
      <h2 className="text-2xl font-bold leading-tight tracking-tight mb-2">
        {round.title || `라운드 #${round.id}`}
      </h2>
      {round.deadline && (
        <p className="text-[12.5px] opacity-90">마감 {formatDateTime(round.deadline)}</p>
      )}
    </div>
  );
}

function SectionHeader({ num, title, right }: { num: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-3 mt-7">
      <div className="flex items-baseline gap-2.5">
        <span className="text-[13px] italic text-clay-500" style={{ fontFamily: 'Georgia, serif' }}>{num}</span>
        <h3 className="text-base font-bold tracking-tight text-ink-900">{title}</h3>
      </div>
      {right}
    </div>
  );
}

/* 매거진 피처 카드 (풀폭, 이미지 + 텍스트) */
function FeatureCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="grid grid-cols-[1.1fr_1fr] bg-paper-card rounded-xl overflow-hidden border border-line mb-3"
    >
      <div className="relative bg-line-soft min-h-[168px]">
        {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />}
        {product.discountRate && product.discountRate > 0 && (
          <span className="absolute top-3 left-3 bg-terra-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {product.discountRate}%
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col justify-center">
        <span className="text-[12px] italic text-clay-600 mb-1.5" style={{ fontFamily: 'Georgia, serif' }}>Best deal</span>
        <span className="text-[11px] text-ink-400">{STORE_LABELS[product.store]}{product.brand && ` · ${product.brand}`}</span>
        <p className="text-[15px] font-bold text-ink-900 leading-snug mt-1 mb-3 line-clamp-2">{product.name}</p>
        <Price sale={product.salePrice} origin={product.originPrice} size="md" />
        <span className="mt-3 self-start text-[12px] font-semibold text-ink-900 border-b-2 border-clay-500 pb-0.5">담기 →</span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const {
    loaded, products, openRounds, latestNotice, lastUpdated,
    storeFilter, selectedBrands, keyword, listScrollY,
    hydrate, setStoreFilter, setSelectedBrands, setKeyword, setListScrollY,
  } = useCatalogStore();

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role === 'pending') return;
    if (loaded) return;

    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/rounds').then((r) => r.json()),
      fetch('/api/users/filter-preset').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/notices').then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([prods, rounds, preset, notices]: [Product[], OrderRound[], any, Notice[]]) => {
      const lastUpdatedStr = prods.length > 0
        ? formatDateTime(prods.reduce((max, p) => (new Date(p.scrapedAt) > new Date(max.scrapedAt) ? p : max)).scrapedAt)
        : null;
      hydrate(
        {
          products: prods,
          openRounds: rounds.filter((r) => r.status === 'open'),
          latestNotice: notices.length > 0 ? notices[0] : null,
          lastUpdated: lastUpdatedStr,
        },
        preset,
      );
    });
  }, [status, session?.user?.role, loaded, hydrate]);

  // 뒤로가기 스크롤 복원 (1회)
  useLayoutEffect(() => {
    if (loaded && listScrollY > 0) {
      window.scrollTo(0, listScrollY);
      setListScrollY(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (status === 'loading') return <PageSkeleton />;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-[13px] tracking-[0.25em] text-clay-500 mb-3">EMPLOYEE BEAUTY</p>
          <h1 className="text-3xl font-bold text-ink-900 mb-2 tracking-tight">ROOTBEER MALL</h1>
          <p className="text-ink-400 mb-8">임직원 할인 공동구매</p>
          <Button variant="accent" size="lg" onClick={() => signIn('google', { callbackUrl: '/' })} className="shadow-lift">
            Google 계정으로 로그인
          </Button>
        </div>
      </div>
    );
  }

  if (session.user.role === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="bg-ocher-50 border border-ocher-500/20 rounded-xl p-8 inline-block">
            <h2 className="font-bold text-lg mb-2 text-ocher-600">승인 대기 중</h2>
            <p className="text-ink-600 text-sm">관리자 승인 후 서비스를 이용할 수 있습니다.</p>
            <p className="text-xs text-ink-400 mt-3">{session.user.email}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loaded) return <PageSkeleton />;

  const storeProducts = storeFilter === 'all' ? products : products.filter((p) => p.store === storeFilter);
  const filtered = storeProducts.filter((p) => {
    if (selectedBrands.length > 0 && (!p.brand || !selectedBrands.includes(p.brand))) return false;
    if (keyword && !p.name.includes(keyword)) return false;
    return true;
  });

  const searchActive = keyword.length > 0 || selectedBrands.length > 0;
  const feed = searchActive ? filtered : storeProducts;

  const deals = storeProducts
    .filter((p) => !p.soldOut && (p.discountRate ?? 0) > 0)
    .sort((a, b) => (b.discountRate ?? 0) - (a.discountRate ?? 0))
    .slice(0, 10);
  const feature = deals[0];

  const clearAll = () => {
    setKeyword('');
    setSelectedBrands([]);
    savePreset(storeFilter, [], '');
  };

  const storeTabs = (
    <div className="flex gap-1">
      {STORE_TABS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => {
            setStoreFilter(opt.value);
            setSelectedBrands([]);
            savePreset(opt.value, [], keyword);
          }}
          className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
            storeFilter === opt.value ? 'bg-ink-900 text-paper font-medium' : 'text-ink-400 hover:text-ink-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {/* 히어로 */}
      {openRounds.length > 0 ? (
        <HeroRound round={openRounds[0]} />
      ) : (
        <div className="-mx-4 -mt-4 mb-5 h-4" />
      )}
      {openRounds.length > 1 && (
        <div className="space-y-1.5 mb-4">
          {openRounds.slice(1).map((r) => (
            <div key={r.id} className="bg-clay-50 rounded-lg px-3 py-2 text-xs text-ink-600">
              <span className="font-semibold text-clay-600">접수중</span>
              {r.title && <span className="ml-1">{r.title}</span>}
              {r.deadline && <span className="text-ink-400 ml-1">· 마감 {formatDateTime(r.deadline)}</span>}
            </div>
          ))}
        </div>
      )}

      {/* 공지 */}
      {latestNotice && (
        <Link
          href={`/notices/${latestNotice.id}`}
          className="flex items-center gap-2 bg-ocher-50 border border-ocher-500/20 rounded-lg px-3 py-2 mb-2 group"
        >
          <span className="text-xs font-semibold text-ocher-600 flex-shrink-0">공지</span>
          <span className="text-xs text-ink-600 truncate group-hover:text-ink-900 transition-colors">{latestNotice.title}</span>
          <span className="text-[10px] text-ink-400 flex-shrink-0 ml-auto">{formatDate(latestNotice.noticeDate)}</span>
        </Link>
      )}
      {lastUpdated && <p className="text-[11px] text-ink-400">상품 갱신 · {lastUpdated}</p>}

      {!searchActive ? (
        <>
          {/* 이번 주 특가 */}
          {deals.length > 0 && (
            <>
              <SectionHeader num="01" title="이번 주 특가" />
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                {deals.map((p) => (
                  <div key={p.id} className="w-40 flex-shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 둘러보기 */}
          <SectionHeader num="02" title="둘러보기" right={storeTabs} />
          {feature && <FeatureCard product={feature} />}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {feed.map((p, i) => (
              <div key={p.id} className="break-inside-avoid mb-3">
                <ProductCard product={p} aspect={i % 3 === 1 ? 'tall' : 'square'} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* 검색/필터 결과 */}
          <div className="flex items-center flex-wrap gap-1.5 mt-6 mb-3">
            {keyword && (
              <button
                onClick={() => { setKeyword(''); savePreset(storeFilter, selectedBrands, ''); }}
                className="text-xs bg-clay-500 text-white rounded-full px-3 py-1 flex items-center gap-1"
              >
                {keyword} <span className="opacity-80">✕</span>
              </button>
            )}
            {selectedBrands.map((b) => (
              <button
                key={b}
                onClick={() => {
                  const next = selectedBrands.filter((x) => x !== b);
                  setSelectedBrands(next);
                  savePreset(storeFilter, next, keyword);
                }}
                className="text-xs bg-clay-500 text-white rounded-full px-3 py-1 flex items-center gap-1"
              >
                {b} <span className="opacity-80">✕</span>
              </button>
            ))}
            <button onClick={clearAll} className="text-xs text-ink-400 hover:text-ink-600 px-2 py-1">전체 보기</button>
            <span className="text-[11px] text-ink-400 ml-auto">{filtered.length}개</span>
          </div>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {feed.map((p, i) => (
              <div key={p.id} className="break-inside-avoid mb-3">
                <ProductCard product={p} aspect={i % 3 === 1 ? 'tall' : 'square'} />
              </div>
            ))}
          </div>
          {filtered.length === 0 && <EmptyState title="상품이 없습니다" description="다른 검색어나 브랜드를 시도해보세요" />}
        </>
      )}
    </div>
  );
}

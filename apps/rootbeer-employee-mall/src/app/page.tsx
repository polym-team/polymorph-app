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
import { isRecommended } from '@/lib/recommend';

const STORE_TABS: { value: string; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'amoremall', label: '아모레몰' },
  { value: 'innisfree', label: '이니스프리' },
];

function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="-mx-4 -mt-4 mb-7 h-60 bg-line-soft" />
      <div className="h-5 bg-line rounded w-24 mb-4" />
      <div className="flex gap-4 mb-6 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-40 flex-shrink-0">
            <div className="aspect-square bg-line-soft rounded-xl mb-2" />
            <div className="h-3 bg-line-soft rounded w-3/4" />
          </div>
        ))}
      </div>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="break-inside-avoid mb-4">
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

/* 진행중 공동구매 — 워밍 에디토리얼 히어로 (라이트 클레이) */
function HeroRound({ round }: { round: OrderRound }) {
  let dday: string | null = null;
  if (round.deadline) {
    const days = Math.ceil((new Date(round.deadline).getTime() - Date.now()) / 86400000);
    if (days >= 0) dday = days === 0 ? 'D-DAY' : `D-${days}`;
  }
  return (
    <div className="relative -mx-4 -mt-4 mb-7 px-6 sm:px-8 pt-9 pb-9 min-h-[248px] flex flex-col justify-end overflow-hidden border-b border-line-soft bg-gradient-to-br from-clay-50 via-paper-card to-ocher-50">
      <div className="flex items-center justify-between mb-auto">
        <span className="font-serif text-[15px] text-clay-600">This week&apos;s edit</span>
        {dday && (
          <span className="bg-ink-900 text-paper text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full tnum">
            {dday}
          </span>
        )}
      </div>
      <h2 className="font-serif text-[30px] sm:text-[38px] leading-[1.12] tracking-tight text-ink-900 mt-7 mb-3 max-w-[20ch]">
        {round.title || '이번 주의 공동구매'}
      </h2>
      {round.deadline && (
        <p className="text-[13px] text-ink-600">마감 {formatDateTime(round.deadline)}</p>
      )}
      <div className="flex items-center gap-2.5 mt-6">
        <a
          href="#shop"
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-900/90 transition-colors"
        >
          이번 주 에디트 보기 <span aria-hidden>→</span>
        </a>
        <Link
          href="/my-orders"
          className="inline-flex items-center h-10 px-5 rounded-full border border-line bg-paper-card/60 text-ink-600 text-[13px] font-medium hover:border-clay-500/60 hover:text-ink-900 transition-colors"
        >
          주문 내역
        </Link>
      </div>
    </div>
  );
}

function SectionHeader({ num, title, right }: { num: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-4 mt-11">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-[18px] text-clay-500 tnum">{num}</span>
        <h3 className="font-serif text-[19px] tracking-tight text-ink-900">{title}</h3>
      </div>
      {right}
    </div>
  );
}

/* 에디터의 선택 — 2단 매거진 피처 카드 (이미지 + 텍스트) */
function FeatureCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group grid grid-cols-[1.1fr_1fr] bg-paper-card rounded-2xl overflow-hidden border border-line-soft mb-4"
    >
      <div className="relative bg-plate min-h-[200px] overflow-hidden">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        )}
        {product.discountRate && product.discountRate > 0 && (
          <span className="absolute top-3 left-3 bg-terra-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full tnum">
            {product.discountRate}%
          </span>
        )}
      </div>
      <div className="p-5 sm:p-6 flex flex-col justify-center">
        <span className="font-serif text-[14px] text-clay-600 mb-2.5">에디터의 선택</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
          {STORE_LABELS[product.store]}{product.brand && ` · ${product.brand}`}
        </span>
        <p className="font-serif text-[18px] text-ink-900 leading-snug mt-1.5 mb-4 line-clamp-2">{product.name}</p>
        <Price sale={product.salePrice} origin={product.originPrice} size="md" />
        <span className="mt-4 self-start font-serif text-[14px] text-ink-900 border-b border-clay-500 pb-0.5 transition-colors group-hover:border-clay-600">
          담기 →
        </span>
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
          <p className="font-serif text-[15px] tracking-[0.2em] text-clay-500 mb-3">Employee Beauty</p>
          <h1 className="font-serif text-4xl text-ink-900 mb-2 tracking-tight">ROOTBEER MALL</h1>
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
            <h2 className="font-serif text-xl mb-2 text-ocher-600">승인 대기 중</h2>
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

  // MD 추천: 상품명 키워드(리퍼/세트/기획/대용량/에디션…) 매칭 상품을 추천.
  // 매칭 우선(할인율 높은 순), 없으면 할인 상품으로 폴백해 섹션이 비지 않게.
  const keywordMatched = storeProducts
    .filter((p) => !p.soldOut && isRecommended(p.name))
    .sort((a, b) => (b.discountRate ?? 0) - (a.discountRate ?? 0));
  const recommended = (
    keywordMatched.length > 0
      ? keywordMatched
      : storeProducts
          .filter((p) => !p.soldOut && (p.discountRate ?? 0) > 0)
          .sort((a, b) => (b.discountRate ?? 0) - (a.discountRate ?? 0))
  ).slice(0, 10);
  const feature = recommended[0];

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
              <span className="font-serif text-clay-600">접수중</span>
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
      {lastUpdated && <p className="text-[11px] text-ink-400 font-serif">Last updated · {lastUpdated}</p>}

      <div id="shop" className="scroll-mt-4" />

      {!searchActive ? (
        <>
          {/* 01 MD 추천 */}
          {recommended.length > 0 && (
            <>
              <SectionHeader num="01" title="MD 추천" />
              <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                {recommended.map((p) => (
                  <div key={p.id} className="w-40 flex-shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 02 에디터의 선택 */}
          {feature && (
            <>
              <SectionHeader num="02" title="에디터의 선택" />
              <FeatureCard product={feature} />
            </>
          )}

          {/* 03 둘러보기 */}
          <SectionHeader num="03" title="둘러보기" right={storeTabs} />
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            {feed.map((p, i) => (
              <div key={p.id} className="break-inside-avoid mb-4">
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
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            {feed.map((p, i) => (
              <div key={p.id} className="break-inside-avoid mb-4">
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

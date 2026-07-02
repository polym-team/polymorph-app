'use client';

import { useState } from 'react';
import { PageHeader, SectionCard, Button } from '@/components/ui';

interface DetailResult {
  processed: number;
  success: number;
  failed: number;
  results: { productId: number; name: string; success: boolean; error?: string }[];
}

interface NoticeResult {
  total: number;
  notices: { id: number; title: string }[];
}

function SuccessBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 bg-sage-50 border border-sage-500/20 rounded-lg p-3 text-sm text-ink-900">
      {children}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 bg-terra-50 border border-terra-500/20 rounded-lg p-3 text-sm text-terra-600">
      {children}
    </div>
  );
}

export default function AdminScrapePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ amoremall: number; innisfree: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailResult, setDetailResult] = useState<DetailResult | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeResult, setNoticeResult] = useState<NoticeResult | null>(null);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      if (res.ok) {
        setResult(await res.json());
      } else {
        setError((await res.json()).error || '스크래핑 실패');
      }
    } catch {
      setError('요청 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeScrape = async () => {
    setNoticeLoading(true);
    setNoticeResult(null);
    setNoticeError(null);

    try {
      const res = await fetch('/api/scrape/notice', { method: 'POST' });
      if (res.ok) {
        setNoticeResult(await res.json());
      } else {
        setNoticeError((await res.json()).error || '공지사항 갱신 실패');
      }
    } catch {
      setNoticeError('요청 실패');
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleDetailScrape = async (limit: number) => {
    setDetailLoading(true);
    setDetailResult(null);
    setDetailError(null);

    try {
      const res = await fetch('/api/scrape/product-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit }),
      });
      if (res.ok) {
        setDetailResult(await res.json());
      } else {
        setDetailError((await res.json()).error || '스크래핑 실패');
      }
    } catch {
      setDetailError('요청 실패');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="상품 갱신" />

      <SectionCard className="p-6">
        <h2 className="font-medium text-ink-900 mb-2">상품 목록 갱신</h2>
        <p className="text-sm text-ink-600 mb-4 leading-relaxed">
          아모레몰과 이니스프리의 임직원 할인 상품을 스크래핑하여 DB에 갱신합니다.
          <br />
          Playwright 브라우저를 사용하므로 1-2분 소요됩니다.
        </p>

        <Button onClick={handleScrape} disabled={loading}>
          {loading ? '스크래핑 중...' : '상품 목록 갱신'}
        </Button>

        {result && (
          <SuccessBox>
            아모레몰: {result.amoremall}개, 이니스프리: {result.innisfree}개 갱신 완료
          </SuccessBox>
        )}
        {error && <ErrorBox>{error}</ErrorBox>}
      </SectionCard>

      <SectionCard className="p-6">
        <h2 className="font-medium text-ink-900 mb-2">상품 상세 스크래핑</h2>
        <p className="text-sm text-ink-600 mb-4 leading-relaxed">
          상세 정보가 없는 아모레몰 상품의 상세 페이지를 스크래핑합니다.
          <br />
          상품당 약 10-15초 소요됩니다.
        </p>

        <div className="flex gap-2 flex-wrap">
          {[3, 5, 10].map((n) => (
            <Button key={n} onClick={() => handleDetailScrape(n)} disabled={detailLoading}>
              {detailLoading ? '처리 중...' : `${n}개 처리`}
            </Button>
          ))}
          <Button variant="danger" onClick={() => handleDetailScrape(9999)} disabled={detailLoading}>
            {detailLoading ? '처리 중...' : '전체 처리'}
          </Button>
        </div>

        {detailResult && (
          <div className="mt-4 space-y-2">
            <SuccessBox>
              처리: {detailResult.processed}개 (성공: {detailResult.success}, 실패: {detailResult.failed})
            </SuccessBox>
            <div className="text-xs space-y-1">
              {detailResult.results.map((r) => (
                <div key={r.productId} className={r.success ? 'text-sage-600' : 'text-terra-600'}>
                  #{r.productId} {r.name.slice(0, 40)}... {r.success ? '성공' : `실패: ${r.error}`}
                </div>
              ))}
            </div>
          </div>
        )}
        {detailError && <ErrorBox>{detailError}</ErrorBox>}
      </SectionCard>

      <SectionCard className="p-6">
        <h2 className="font-medium text-ink-900 mb-2">임직원 공지사항 갱신</h2>
        <p className="text-sm text-ink-600 mb-4 leading-relaxed">
          아모레몰 임직원(퍼시픽샵) 공지사항을 가져와 DB에 저장합니다.
          <br />
          Playwright 브라우저를 사용하므로 1-2분 소요됩니다.
        </p>

        <Button onClick={handleNoticeScrape} disabled={noticeLoading}>
          {noticeLoading ? '갱신 중...' : '공지사항 갱신'}
        </Button>

        {noticeResult && (
          <div className="mt-4 space-y-2">
            <SuccessBox>신규 공지사항 {noticeResult.total}건 저장 완료</SuccessBox>
            {noticeResult.notices.length > 0 && (
              <div className="text-xs space-y-1">
                {noticeResult.notices.map((n) => (
                  <div key={n.id} className="text-sage-600">
                    #{n.id} {n.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {noticeError && <ErrorBox>{noticeError}</ErrorBox>}
      </SectionCard>
    </div>
  );
}

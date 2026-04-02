'use client';

import { useState } from 'react';

interface DetailResult {
  processed: number;
  success: number;
  failed: number;
  results: { productId: number; name: string; success: boolean; error?: string }[];
}

export default function AdminScrapePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ amoremall: number; innisfree: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailResult, setDetailResult] = useState<DetailResult | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

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
      <h1 className="text-xl font-bold">상품 갱신</h1>

      <div className="bg-white rounded border p-6">
        <h2 className="font-medium mb-2">상품 목록 갱신</h2>
        <p className="text-sm text-gray-600 mb-4">
          아모레몰과 이니스프리의 임직원 할인 상품을 스크래핑하여 DB에 갱신합니다.
          <br />
          Playwright 브라우저를 사용하므로 1-2분 소요됩니다.
        </p>

        <button
          onClick={handleScrape}
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded text-sm hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? '스크래핑 중...' : '상품 목록 갱신'}
        </button>

        {result && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded p-3 text-sm">
            아모레몰: {result.amoremall}개, 이니스프리: {result.innisfree}개 갱신 완료
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded border p-6">
        <h2 className="font-medium mb-2">상품 상세 스크래핑</h2>
        <p className="text-sm text-gray-600 mb-4">
          상세 정보가 없는 아모레몰 상품의 상세 페이지를 스크래핑합니다.
          <br />
          상품당 약 10-15초 소요됩니다.
        </p>

        <div className="flex gap-2">
          {[3, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => handleDetailScrape(n)}
              disabled={detailLoading}
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:bg-gray-400"
            >
              {detailLoading ? '처리 중...' : `${n}개 처리`}
            </button>
          ))}
        </div>

        {detailResult && (
          <div className="mt-4 space-y-2">
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
              처리: {detailResult.processed}개 (성공: {detailResult.success}, 실패: {detailResult.failed})
            </div>
            <div className="text-xs space-y-1">
              {detailResult.results.map((r) => (
                <div
                  key={r.productId}
                  className={r.success ? 'text-green-700' : 'text-red-600'}
                >
                  #{r.productId} {r.name.slice(0, 40)}... {r.success ? '성공' : `실패: ${r.error}`}
                </div>
              ))}
            </div>
          </div>
        )}
        {detailError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            {detailError}
          </div>
        )}
      </div>
    </div>
  );
}

import type { Page } from 'playwright';

export interface ProductDetailData {
  description: string | null;
  images: string[];
  detailHtml: string | null;
}

export async function scrapeProductDetail(
  page: Page,
  productUrl: string,
): Promise<ProductDetailData> {
  await page.goto(productUrl, { waitUntil: 'networkidle', timeout: 30000 });

  // URL에서 onlineProdCode 추출 (리다이렉트 후 URL에 포함됨)
  const currentUrl = page.url();
  const prodCodeMatch = currentUrl.match(/onlineProdCode=(\d+)/);
  const prodCode = prodCodeMatch?.[1] ?? null;

  const data = await page.evaluate((code: string | null) => {
    // 상품 설명 추출
    let description: string | null = null;
    const descEl =
      document.querySelector('.infoDetailWrap') ??
      document.querySelector('[class*="productDetail"] .desc');
    if (descEl) {
      description = descEl.textContent?.trim() ?? null;
    }

    if (!description) {
      const meta = document.querySelector('meta[name="description"]');
      description = meta?.getAttribute('content') ?? null;
    }

    // 상품 이미지 추출: 해당 상품 코드의 _01~_04만
    const imageSet = new Set<string>();
    if (code) {
      document.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('data-src') || img.src;
        if (!src || !src.includes(`/products/${code}/${code}_`)) return;

        // _0N 패턴 확인 (01~04)
        const numMatch = src.match(new RegExp(`${code}_(\\d+)\\.`));
        if (!numMatch) return;
        const num = parseInt(numMatch[1], 10);
        if (num < 1 || num > 4) return;

        const cleanUrl = src.split('&resize=')[0].split('&format=')[0].split('&shrink=')[0];
        imageSet.add(cleanUrl);
      });
    }

    // 상세 HTML
    let detailHtml: string | null = null;
    const detailEl = document.querySelector('.infoDetailWrap');
    if (detailEl) {
      detailHtml = detailEl.innerHTML;
    }

    return {
      description,
      images: Array.from(imageSet),
      detailHtml,
    };
  }, prodCode);

  return data;
}

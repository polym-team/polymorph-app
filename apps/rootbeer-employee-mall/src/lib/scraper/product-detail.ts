import type { Page } from 'playwright';

export interface ProductOption {
  externalId: string;
  name: string;
  price: number | null;
  discountRate: number | null;
  sortOrder: number;
}

export interface ProductDetailData {
  description: string | null;
  images: string[];
  detailHtml: string | null;
  options: ProductOption[];
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

    // 상품 옵션 추출
    const options: { externalId: string; name: string; price: number | null; discountRate: number | null; sortOrder: number }[] = [];
    document.querySelectorAll('.selectProdOption .optionSheet ul li').forEach((li, i) => {
      const nameEl = li.querySelector('.prodInfo .name');
      const name = nameEl?.textContent?.trim() ?? '';

      // 이미지 URL에서 unitproducts/{id} 추출
      const img = li.querySelector('img');
      const imgSrc = img?.getAttribute('data-src') || img?.getAttribute('src') || '';
      const idMatch = imgSrc.match(/unitproducts\/(\d+)\//);
      const externalId = idMatch?.[1] ?? '';

      if (!externalId || !name) return;

      // 가격 추출
      const priceEl = li.querySelector('.price .val');
      const priceText = priceEl?.textContent?.replace(/,/g, '').trim() ?? '';
      const price = priceText ? parseInt(priceText, 10) : null;

      // 할인율 추출
      const discountEl = li.querySelector('.discountRate');
      const discountText = discountEl?.textContent?.replace(/%/g, '').trim() ?? '';
      const discountRate = discountText ? parseInt(discountText, 10) : null;

      options.push({ externalId, name, price, discountRate, sortOrder: i });
    });

    return {
      description,
      images: Array.from(imageSet),
      detailHtml,
      options,
    };
  }, prodCode);

  return data;
}

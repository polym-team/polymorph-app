const BASE_URL = 'https://api-gw.amoremall.com/display/v2/M01/online-products/pacific';
const PRODUCT_PAGE_URL = 'https://www.amoremall.com/kr/ko/product/detail';
const LIMIT = 45;

export interface AmoremallProduct {
  goodsNo: number;
  goodsName: string;
  brandName: string;
  salePrice: number;
  originPrice: number;
  discountRate: number;
  imageUrl: string;
  productUrl: string;
  soldOut: boolean;
}

interface ApiProduct {
  onlineProdSn: number;
  onlineProdCode: string;
  onlineProdName: string;
  brandName: string;
  standardPrice: number;
  discountedPrice: number;
  discountRate: number;
  imgUrl: string;
  saleDisplayStatus: string;
  [key: string]: unknown;
}

interface ApiResponse {
  products: ApiProduct[];
  totalCount: number;
  [key: string]: unknown;
}

function normalizeProduct(raw: ApiProduct): AmoremallProduct {
  return {
    goodsNo: raw.onlineProdSn,
    goodsName: raw.onlineProdName,
    brandName: raw.brandName,
    salePrice: raw.discountedPrice,
    originPrice: raw.standardPrice,
    discountRate: raw.discountRate,
    imageUrl: raw.imgUrl,
    productUrl: `${PRODUCT_PAGE_URL}?onlineProdSn=${raw.onlineProdSn}`,
    soldOut: raw.saleDisplayStatus !== 'OnSale',
  };
}

export async function fetchAllProducts(token: string): Promise<AmoremallProduct[]> {
  const allProducts: AmoremallProduct[] = [];
  let offset = 0;

  while (true) {
    const url = new URL(BASE_URL);
    url.searchParams.set('containsFilter', 'false');
    url.searchParams.set('containsOutOfStock', 'true');
    url.searchParams.set('limit', String(LIMIT));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('pacificShop', 'false');
    url.searchParams.set('sortType', 'NewProd');
    url.searchParams.set('topFix', 'true');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Origin: 'https://www.amoremall.com',
        Referer: 'https://www.amoremall.com/',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`상품 목록 조회 실패 (${res.status}): ${text}`);
    }

    const data = (await res.json()) as ApiResponse;
    const products = data.products ?? [];

    if (products.length === 0) break;

    allProducts.push(...products.map(normalizeProduct));

    const totalCount = data.totalCount ?? Infinity;
    offset += LIMIT;

    if (offset >= totalCount) break;

    console.log(`  ${allProducts.length}/${totalCount} 상품 로드됨...`);
  }

  return allProducts;
}

const TARGET_BRANDS = ['설화수', '헤라', '프리메라', '아윤채', '아모스 프로페셔널'];
const TARGET_NAME_KEYWORDS = ['기획', '세트', '리퍼'];

export function filterProducts(products: AmoremallProduct[]): AmoremallProduct[] {
  return products.filter((p) => {
    const brandMatch = TARGET_BRANDS.some((b) => p.brandName === b);
    const nameMatch = TARGET_NAME_KEYWORDS.some((kw) => p.goodsName.includes(kw));
    return brandMatch || nameMatch;
  });
}

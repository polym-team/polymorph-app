import type { BrowserContext } from 'playwright';

const INNISFREE_EMPLOYEES = 'https://www.innisfree.com/kr/ko/dp/employees';
const API_PATH = '/kr/ko/dp/node/search/product';
const PRODUCT_PAGE_URL = 'https://www.innisfree.com/kr/ko/product';

export interface InnisfreeProduct {
  productId: string;
  name: string;
  listPrice: number;
  employeePrice: number;
  employeeRate: number;
  imageUrl: string;
  productUrl: string;
  soldOut: boolean;
}

interface ApiProduct {
  product_id: string;
  name: { ko: string };
  list_price: number;
  employee_price: number;
  employee_rate: number;
  main_image: string;
  sale_status: string;
  [key: string]: unknown;
}

interface ApiResponse {
  code: string;
  data: {
    content: ApiProduct[];
    total_elements: number;
  };
}

function normalizeProduct(raw: ApiProduct): InnisfreeProduct {
  return {
    productId: raw.product_id,
    name: raw.name.ko,
    listPrice: raw.list_price,
    employeePrice: raw.employee_price,
    employeeRate: raw.employee_rate,
    imageUrl: raw.main_image,
    productUrl: `${PRODUCT_PAGE_URL}/${raw.product_id}`,
    soldOut: raw.sale_status !== '1',
  };
}

const REQUEST_BODY = {
  q: '',
  size: 9999,
  mall_list: ['innisfree2'],
  display_flag: 'Y',
  retrieve_type: 'employeeonly',
  ranking_type: 'innisfree',
  page: 1,
  index_name: 'product_index',
  attribute_skin_troubles: [],
  category: {},
  properties: [
    'product_id',
    'name.ko',
    'list_price',
    'discount_rate',
    'discounted_price',
    'main_image',
    'employee_rate',
    'employee_price',
    'sale_status',
  ],
  sort: { recommend_rank: 'ASC', created: 'DESC' },
  employee_only_yn: 'N',
  sale_status: ['1', '2', '4'],
};

/**
 * Playwright 브라우저 컨텍스트를 이용하여 이니스프리 임직원 상품 조회.
 * 이니스프리 페이지에 접속 후 page.evaluate로 API 호출 (지역 리다이렉트 우회).
 */
export async function fetchAllProducts(context: BrowserContext): Promise<InnisfreeProduct[]> {
  const page = await context.newPage();

  try {
    console.log('  [이니스프리] 임직원 페이지 접속...');
    await page.goto(INNISFREE_EMPLOYEES, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    console.log(`  [이니스프리] 현재 URL: ${page.url()}`);

    console.log('  [이니스프리] API 호출...');
    const result = await page.evaluate(
      async ({ apiPath, body }) => {
        const res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const text = await res.text();
        try {
          return { ok: true, data: JSON.parse(text) };
        } catch {
          return { ok: false, status: res.status, body: text.slice(0, 300) };
        }
      },
      { apiPath: API_PATH, body: REQUEST_BODY },
    );

    if (!result.ok) {
      throw new Error(`[이니스프리] API 오류 (${(result as any).status}): ${(result as any).body}`);
    }

    const data = (result as { ok: true; data: ApiResponse }).data;

    if (data.code !== '0000') {
      throw new Error(`[이니스프리] API 오류: ${data.code}`);
    }

    const products = data.data.content.map(normalizeProduct);
    console.log(`  [이니스프리] 총 ${products.length}/${data.data.total_elements} 상품 로드됨`);

    return products;
  } finally {
    await page.close();
  }
}

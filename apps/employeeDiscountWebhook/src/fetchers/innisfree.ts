import type { Page } from 'playwright';

const INNISFREE_EMPLOYEES = 'https://www.innisfree.com/kr/ko/dp/employees';
const API_PATH = '/kr/ko/dp/node/search/product-filter';
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
 * Playwright 브라우저 페이지를 이용하여 이니스프리 임직원 상품 조회
 * (이니스프리 도메인 내에서 fetch 호출하여 쿠키/세션 자동 포함)
 */
export async function fetchAllProducts(page: Page): Promise<InnisfreeProduct[]> {
  // 이니스프리 임직원 페이지로 이동 (도메인 컨텍스트 확보)
  console.log('  [이니스프리] 임직원 페이지 접속...');
  await page.goto(INNISFREE_EMPLOYEES, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  console.log(`  [이니스프리] 현재 URL: ${page.url()}`);

  // 브라우저 내에서 API 호출 (절대 URL 사용)
  const apiUrl = `https://www.innisfree.com${API_PATH}`;
  console.log(`  [이니스프리] API 호출: ${apiUrl}`);
  const result = await page.evaluate(async ({ apiUrl, body }) => {
    const res = await fetch(apiUrl, {
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
  }, { apiUrl, body: REQUEST_BODY });

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
}

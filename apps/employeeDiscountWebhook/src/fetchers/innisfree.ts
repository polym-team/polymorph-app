const API_URL = 'https://www.innisfree.com/kr/ko/dp/node/search/product';
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

export async function fetchAllProducts(token: string): Promise<InnisfreeProduct[]> {
  console.log(`  [이니스프리] API 호출: ${API_URL}`);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Origin: 'https://www.innisfree.com',
      Referer: 'https://www.innisfree.com/kr/ko/dp/employees',
    },
    body: JSON.stringify(REQUEST_BODY),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`[이니스프리] API 오류 (${res.status}): ${text.slice(0, 300)}`);
  }

  let data: ApiResponse;
  try {
    data = JSON.parse(text) as ApiResponse;
  } catch {
    throw new Error(`[이니스프리] JSON 파싱 실패 (${res.status}): ${text.slice(0, 300)}`);
  }

  if (data.code !== '0000') {
    throw new Error(`[이니스프리] API 오류: ${data.code}`);
  }

  const products = data.data.content.map(normalizeProduct);
  console.log(`  [이니스프리] 총 ${products.length}/${data.data.total_elements} 상품 로드됨`);

  return products;
}

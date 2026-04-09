import type { BrowserContext } from 'playwright';

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

// ── 상품 상세 API ──

const DETAIL_API_URL = 'https://www.innisfree.com/api/dp/product/detail/v1/getPrdDtlInfo';
const DETAIL_IMG_API_URL = 'https://www.innisfree.com/api/dp/product/detail/v1/getPrdDtlImgList';

export interface InnisfreeProductOption {
  externalId: string;
  name: string;
  stock: number;
  sortOrder: number;
}

export interface InnisfreeProductDetail {
  description: string | null;
  images: string[];
  options: InnisfreeProductOption[];
  rawJson: string;
}

interface DetailApiOption {
  inmOptnPrdNo: string;
  prdCd: string;
  prdOptnNm: string;
  onlnInvnQty: number;
  wrhsTcReqYn: string;
  useLimitDate: string;
}

interface DetailApiResponse {
  statusCode: number;
  data: {
    inmPrdNm: string;
    opntTxt: string | null;
    tagListVl: string | null;
    optnList?: DetailApiOption[];
    [key: string]: unknown;
  };
}

interface DetailImgApiResponse {
  statusCode: number;
  data: {
    imgList: { usdtAcesUrl: string; inmPrdImgTpCd: string; imgExpsSn: number }[];
  };
}

export async function fetchInnisfreeProductDetail(
  context: BrowserContext,
  inmPrdNo: string,
): Promise<InnisfreeProductDetail> {
  const data = { inmPrdNo, inmChnCd: '1' };
  const headers = { 'Content-Type': 'application/json' };

  const [detailRes, imgRes] = await Promise.all([
    context.request.post(DETAIL_API_URL, { headers, data }),
    context.request.post(DETAIL_IMG_API_URL, { headers, data }),
  ]);

  if (!detailRes.ok()) {
    throw new Error(`[이니스프리 상세] API 오류 (${detailRes.status()})`);
  }

  const detailData = (await detailRes.json()) as DetailApiResponse;
  if (detailData.statusCode !== 200) {
    throw new Error(`[이니스프리 상세] statusCode: ${detailData.statusCode}`);
  }

  let images: string[] = [];
  if (imgRes.ok()) {
    const imgData = (await imgRes.json()) as DetailImgApiResponse;
    if (imgData.statusCode === 200 && imgData.data?.imgList) {
      images = imgData.data.imgList
        .sort((a, b) => a.imgExpsSn - b.imgExpsSn)
        .map((img) => img.usdtAcesUrl);
    }
  }

  const options: InnisfreeProductOption[] = (detailData.data.optnList ?? []).map((opt, i) => ({
    externalId: opt.inmOptnPrdNo,
    name: opt.prdOptnNm,
    stock: opt.onlnInvnQty,
    sortOrder: i,
  }));

  return {
    description: detailData.data.opntTxt ?? null,
    images,
    options,
    rawJson: JSON.stringify(detailData.data),
  };
}

// ── 상품 목록 API ──

export async function fetchAllProducts(context: BrowserContext): Promise<InnisfreeProduct[]> {
  const res = await context.request.post(API_URL, {
    headers: { 'Content-Type': 'application/json' },
    data: REQUEST_BODY,
  });

  const text = await res.text();

  if (!res.ok()) {
    throw new Error(`[이니스프리] API 오류 (${res.status()}): ${text.slice(0, 300)}`);
  }

  let data: ApiResponse;
  try {
    data = JSON.parse(text) as ApiResponse;
  } catch {
    throw new Error(`[이니스프리] JSON 파싱 실패: ${text.slice(0, 300)}`);
  }

  if (data.code !== '0000') {
    throw new Error(`[이니스프리] API 오류: ${data.code}`);
  }

  return data.data.content.map(normalizeProduct);
}

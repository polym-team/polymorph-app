import type { BrowserContext } from 'playwright';

const NOTICE_LIST_URL =
  'https://api-gw.amoremall.com/display/apcp/display/v2/M01/notice';
const NOTICE_VIEW_URL = 'https://www.amoremall.com/kr/ko/cs/noticeView';

interface NoticeListItem {
  foNoticeSn: number;
  foNoticeTypeId: string;
  foNoticeTitle: string;
  noticeStartDt: string;
}

interface NoticeListResponse {
  foNoticeList: NoticeListItem[];
  totalCount: number;
}

export interface NoticeData {
  externalId: number;
  title: string;
  content: string | null;
  noticeDate: Date;
}

export async function fetchPshopNotices(
  token: string,
): Promise<NoticeListItem[]> {
  const all: NoticeListItem[] = [];
  let offset = 0;
  const limit = 10;

  while (true) {
    const url = new URL(NOTICE_LIST_URL);
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(limit));

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
      throw new Error(`공지사항 목록 조회 실패 (${res.status}): ${text}`);
    }

    const data = (await res.json()) as NoticeListResponse;
    const notices = data.foNoticeList ?? [];

    const pshopNotices = notices.filter((n) => n.foNoticeTypeId === 'PSHOP');
    all.push(...pshopNotices);

    offset += limit;
    if (offset >= data.totalCount) break;
  }

  return all;
}

export async function scrapeNoticeContent(
  context: BrowserContext,
  foNoticeSn: number,
): Promise<string | null> {
  const page = await context.newPage();

  try {
    const url = `${NOTICE_VIEW_URL}/${foNoticeSn}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    const content = await page
      .locator('article')
      .first()
      .innerHTML({ timeout: 15000 })
      .catch(() => null);

    return content;
  } finally {
    await page.close();
  }
}

export async function fetchAndScrapeNotices(
  token: string,
  context: BrowserContext,
  existingIds: Set<number>,
): Promise<NoticeData[]> {
  const notices = await fetchPshopNotices(token);
  const newNotices = notices.filter((n) => !existingIds.has(n.foNoticeSn));

  console.log(
    `[notice] PSHOP 공지 ${notices.length}건 중 신규 ${newNotices.length}건`,
  );

  const results: NoticeData[] = [];

  for (const notice of newNotices) {
    const content = await scrapeNoticeContent(context, notice.foNoticeSn);
    results.push({
      externalId: notice.foNoticeSn,
      title: notice.foNoticeTitle,
      content,
      noticeDate: new Date(notice.noticeStartDt),
    });
    console.log(`[notice] #${notice.foNoticeSn} "${notice.foNoticeTitle}" 스크래핑 완료`);
  }

  return results;
}

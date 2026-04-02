import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

const PACIFIC_SHOP = 'https://www.amoremall.com/kr/ko/display/pacificShop';

export interface AuthSession {
  token: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export async function loginAndGetSession(id: string, pw: string): Promise<AuthSession> {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  console.log('[auth] 임직원몰 페이지 접속...');
  await page.goto(PACIFIC_SHOP, { waitUntil: 'networkidle', timeout: 30000 });

  await dismissPopups(page);

  console.log('[auth] 자격증명 입력...');
  await page.locator('#loginid').fill(id);
  await page.locator('#loginpassword').fill(pw);

  console.log('[auth] 로그인 제출...');
  await page.locator('#dologin').click();

  await page.waitForURL(/amoremall\.com.*pacificShop/i, { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

  const token = await extractToken(context, page);

  if (!token) {
    await browser.close();
    throw new Error('로그인 후 액세스 토큰을 찾을 수 없습니다.');
  }

  console.log('[auth] 토큰 획득 완료');
  return { token, browser, context, page };
}

async function dismissPopups(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('.popupBg, .popup-bg, .modal-backdrop').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    document
      .querySelectorAll<HTMLElement>(
        '.popup .btn-close, .popup .close, [class*="popup"] [class*="close"], [class*="modal"] [class*="close"]',
      )
      .forEach((btn) => btn.click());
  });
  await page.waitForTimeout(500);
}

async function extractToken(context: BrowserContext, page: Page): Promise<string | null> {
  const cookies = await context.cookies();
  for (const name of ['accessToken', 'access_token', 'AM_TOKEN', 'auth_token', 'token']) {
    const cookie = cookies.find((c: { name: string; value: string }) => c.name === name);
    if (cookie) return cookie.value;
  }
  for (const cookie of cookies) {
    if (cookie.value.includes('eyJ') && cookie.value.length > 100) {
      return cookie.value;
    }
  }

  const storageToken = await page.evaluate(() => {
    for (const storage of [localStorage, sessionStorage]) {
      for (const key of ['accessToken', 'access_token', 'token', 'auth_token', 'AM_TOKEN']) {
        const val = storage.getItem(key);
        if (val) return val;
      }
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;
        const val = storage.getItem(key) ?? '';
        if (val.includes('eyJ') && val.length > 50) {
          try {
            const parsed = JSON.parse(val);
            return parsed.accessToken ?? parsed.access_token ?? parsed.token ?? null;
          } catch {
            if (val.startsWith('eyJ')) return val;
          }
        }
      }
    }
    return null;
  });

  return storageToken;
}

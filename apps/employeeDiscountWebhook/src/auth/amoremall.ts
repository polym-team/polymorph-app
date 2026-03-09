import { chromium } from 'playwright';

const PACIFIC_SHOP = 'https://www.amoremall.com/kr/ko/display/pacificShop';

/**
 * Playwright 헤드리스 브라우저로 아모레몰 로그인 후 Bearer 토큰 획득
 *
 * 1. 아모레몰 로그인 페이지 → IDP 리다이렉트
 * 2. ID/PW 입력 후 로그인
 * 3. 리다이렉트 완료 후 쿠키/localStorage에서 토큰 추출
 */
export async function getAmoremallToken(id: string, pw: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // 1. 임직원몰 페이지로 이동 → 미로그인 시 IDP 로그인 페이지로 자동 리다이렉트
    console.log('   [auth] 임직원몰 페이지 접속 (로그인 리다이렉트 대기)...');
    await page.goto(PACIFIC_SHOP, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`   [auth] 현재 URL: ${page.url()}`);

    // 2. 팝업이 있으면 닫기
    await dismissPopups(page);

    // 3. ID/PW 입력 (IDP 로그인 폼: #loginid, #loginpassword)
    console.log('   [auth] 자격증명 입력...');
    await page.locator('#loginid').fill(id);
    await page.locator('#loginpassword').fill(pw);

    // 4. 로그인 버튼 클릭
    console.log('   [auth] 로그인 제출...');
    await page.locator('#dologin').click();

    // 5. 임직원몰 페이지로 리다이렉트 완료 대기
    console.log('   [auth] 로그인 완료 대기...');
    await page.waitForURL(/amoremall\.com.*pacificShop/i, { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    console.log(`   [auth] 로그인 후 URL: ${page.url()}`);

    // 6. 토큰 추출 (쿠키 → localStorage → sessionStorage)
    const token = await extractToken(context, page);

    if (!token) {
      throw new Error('로그인 후 액세스 토큰을 찾을 수 없습니다.');
    }

    console.log('   [auth] 토큰 획득 완료');
    return token;
  } finally {
    await browser.close();
  }
}

async function dismissPopups(page: import('playwright').Page) {
  await page.evaluate(() => {
    document.querySelectorAll('.popupBg, .popup-bg, .modal-backdrop').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    document.querySelectorAll<HTMLElement>(
      '.popup .btn-close, .popup .close, [class*="popup"] [class*="close"], [class*="modal"] [class*="close"]',
    ).forEach((btn) => btn.click());
  });
  await page.waitForTimeout(500);
}

async function extractToken(
  context: import('playwright').BrowserContext,
  page: import('playwright').Page,
): Promise<string | null> {
  // 1. 쿠키에서 토큰 찾기
  const cookies = await context.cookies();
  for (const name of ['accessToken', 'access_token', 'AM_TOKEN', 'auth_token', 'token']) {
    const cookie = cookies.find((c) => c.name === name);
    if (cookie) return cookie.value;
  }
  // JWT-like 쿠키 찾기
  for (const cookie of cookies) {
    if (cookie.value.includes('eyJ') && cookie.value.length > 100) {
      console.log(`   [auth] JWT 토큰 쿠키 발견: ${cookie.name}`);
      return cookie.value;
    }
  }

  // 2. localStorage에서 토큰 찾기
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
  if (storageToken) return storageToken;

  // 3. 디버그 정보 출력
  console.log('   [auth] 토큰을 찾지 못함. 디버그 정보:');
  console.log('   쿠키:', cookies.map((c) => `${c.name}=${c.value.slice(0, 30)}...`).join('\n         '));
  const allKeys = await page.evaluate(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(`ls:${localStorage.key(i)}`);
    for (let i = 0; i < sessionStorage.length; i++) keys.push(`ss:${sessionStorage.key(i)}`);
    return keys;
  });
  console.log('   스토리지 키:', allKeys.join(', '));

  return null;
}

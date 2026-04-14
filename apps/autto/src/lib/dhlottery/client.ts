import { CookieJar, Cookie } from 'tough-cookie';
import { rsaEncrypt } from './rsa';
import { getCurrentRound, calculateDrawDates, getKSTDate } from './round';
import type {
  Lotto645Ticket,
  BalanceInfo,
  BuyResult,
  BuySlot,
  PurchaseHistoryItem,
} from './types';
import { Lotto645Mode } from './types';

const BASE_URL = 'https://www.dhlottery.co.kr';
const OL_BASE_URL = 'https://ol.dhlottery.co.kr';

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  Connection: 'keep-alive',
  'Cache-Control': 'max-age=0',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-User': '?1',
  'Sec-Fetch-Dest': 'document',
};

export class DhLotteryClient {
  private cookieJar: CookieJar;
  private userId: string;
  private userPw: string;

  private constructor(userId: string, userPw: string) {
    this.cookieJar = new CookieJar();
    this.userId = userId;
    this.userPw = userPw;
  }

  /**
   * 클라이언트 생성 + 로그인 (팩토리 메서드)
   */
  static async create(userId: string, userPw: string): Promise<DhLotteryClient> {
    const client = new DhLotteryClient(userId, userPw);
    await client.login();
    return client;
  }

  private async fetch(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const cookieString = await this.cookieJar.getCookieString(url);
    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...(options.headers as Record<string, string> || {}),
    };
    if (cookieString) {
      headers['Cookie'] = cookieString;
    }

    const resp = await fetch(url, {
      ...options,
      headers,
      redirect: 'manual',
    });

    // Set-Cookie 처리
    const setCookies = resp.headers.getSetCookie?.() ?? [];
    for (const sc of setCookies) {
      try {
        const cookie = Cookie.parse(sc);
        if (cookie) {
          await this.cookieJar.setCookie(cookie, url);
        }
      } catch {
        // 무시
      }
    }

    return resp;
  }

  /**
   * 리다이렉트를 수동으로 따라가면서 쿠키를 유지
   */
  private async fetchWithRedirects(
    url: string,
    options: RequestInit = {},
    maxRedirects = 10,
  ): Promise<Response> {
    let currentUrl = url;
    let resp: Response;

    for (let i = 0; i < maxRedirects; i++) {
      resp = await this.fetch(currentUrl, options);

      if (resp.status >= 300 && resp.status < 400) {
        const location = resp.headers.get('location');
        if (!location) break;
        currentUrl = location.startsWith('http')
          ? location
          : new URL(location, currentUrl).toString();
        // 리다이렉트 시 GET으로 전환
        options = { ...options, method: 'GET', body: undefined };
        continue;
      }

      return resp;
    }

    return resp!;
  }

  private async login(): Promise<void> {
    // 1. 메인 페이지 접속 (세션 쿠키 획득)
    const mainResp = await this.fetchWithRedirects(`${BASE_URL}/`);
    const mainUrl = mainResp.url || `${BASE_URL}/`;
    if (mainUrl.includes('index_check.html')) {
      throw new Error('동행복권 사이트가 현재 시스템 점검중입니다.');
    }

    // 2. 로그인 페이지
    await this.fetchWithRedirects(`${BASE_URL}/login`);

    // 3. RSA 공개키 요청
    const rsaResp = await this.fetch(`${BASE_URL}/login/selectRsaModulus.do`, {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `${BASE_URL}/login`,
      },
    });
    const rsaData = await rsaResp.json() as {
      data?: { rsaModulus: string; publicExponent: string };
    };

    if (!rsaData.data) {
      throw new Error('RSA 키를 가져올 수 없습니다.');
    }

    const { rsaModulus, publicExponent } = rsaData.data;

    // 4. 아이디/비밀번호 RSA 암호화 + 로그인
    const encryptedUserId = rsaEncrypt(this.userId, rsaModulus, publicExponent);
    const encryptedPassword = rsaEncrypt(this.userPw, rsaModulus, publicExponent);

    const loginBody = new URLSearchParams({
      userId: encryptedUserId,
      userPswdEncn: encryptedPassword,
      inpUserId: this.userId,
    });

    const loginResp = await this.fetchWithRedirects(
      `${BASE_URL}/login/securityLoginCheck.do`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Origin: BASE_URL,
          Referer: `${BASE_URL}/login`,
        },
        body: loginBody.toString(),
      },
    );

    const loginUrl = loginResp.url || '';
    const loginText = await loginResp.text();

    if (loginResp.status !== 200 || !loginUrl.includes('loginSuccess')) {
      // 에러 메시지 확인
      if (loginText.includes('btn_common')) {
        throw new Error('로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.');
      }
      throw new Error(`로그인에 실패했습니다. (Status: ${loginResp.status})`);
    }

    // 5. 메인 페이지 방문
    await this.fetchWithRedirects(`${BASE_URL}/main`);

    // 6. 구매 도메인 접속 (JSESSIONID 획득)
    await this.fetchWithRedirects(`${OL_BASE_URL}/olotto/game/game645.do`);
  }

  /**
   * 로또 6/45 구매
   */
  async buyLotto645(tickets: Lotto645Ticket[]): Promise<BuyResult> {
    if (tickets.length === 0 || tickets.length > 5) {
      throw new Error('1~5개의 티켓만 구매할 수 있습니다.');
    }

    // ready_ip 획득
    const readyResp = await this.fetch(
      `${OL_BASE_URL}/olotto/game/egovUserReadySocket.json`,
      { method: 'POST' },
    );
    const readyData = await readyResp.json() as { ready_ip: string };
    const direct = readyData.ready_ip;

    const roundNumber = getCurrentRound();
    const { drawDate, payLimitDate } = calculateDrawDates();

    const drawDateStr = `${drawDate.getFullYear()}/${String(drawDate.getMonth() + 1).padStart(2, '0')}/${String(drawDate.getDate()).padStart(2, '0')}`;
    const payLimitStr = `${payLimitDate.getFullYear()}/${String(payLimitDate.getMonth() + 1).padStart(2, '0')}/${String(payLimitDate.getDate()).padStart(2, '0')}`;

    const param = this.makeBuyParam(tickets);

    const body = new URLSearchParams({
      round: String(roundNumber),
      direct,
      nBuyAmount: String(1000 * tickets.length),
      param,
      ROUND_DRAW_DATE: drawDateStr,
      WAMT_PAY_TLMT_END_DT: payLimitStr,
      gameCnt: String(tickets.length),
      saleMdaDcd: '10',
    });

    const buyResp = await this.fetch(`${OL_BASE_URL}/olotto/game/execBuy.do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: `${OL_BASE_URL}/olotto/game/game645.do`,
        Origin: OL_BASE_URL,
      },
      body: body.toString(),
    });

    const response = await buyResp.json() as {
      result: {
        resultCode: string;
        resultMsg: string;
        arrGameChoiceNum?: string[];
      };
    };

    if (response.result.resultCode !== '100') {
      return {
        success: false,
        message: response.result.resultMsg,
        roundNo: roundNumber,
        slots: [],
      };
    }

    const slots = this.formatLottoNumbers(response.result.arrGameChoiceNum || []);
    return {
      success: true,
      message: '구매 성공',
      roundNo: roundNumber,
      slots,
    };
  }

  private makeBuyParam(tickets: Lotto645Ticket[]): string {
    const params = tickets.map((t, i) => {
      let genType: string;
      if (t.mode === Lotto645Mode.AUTO) genType = '0';
      else if (t.mode === Lotto645Mode.MANUAL) genType = '1';
      else if (t.mode === Lotto645Mode.SEMIAUTO) genType = '2';
      else throw new Error(`올바르지 않은 모드입니다. (mode: ${t.mode})`);

      const arrGameChoiceNum =
        t.mode === Lotto645Mode.AUTO ? null : t.numbers.join(',');
      const alpabet = 'ABCDE'[i]; // XXX: 오타 아님 (서버가 이 키명을 기대함)

      return { genType, arrGameChoiceNum, alpabet };
    });

    return JSON.stringify(params);
  }

  private formatLottoNumbers(lines: string[]): BuySlot[] {
    const modeDict: Record<string, string> = {
      '1': '수동',
      '2': '반자동',
      '3': '자동',
    };

    return lines.map((line) => ({
      mode: modeDict[line[line.length - 1]] || '자동',
      slot: line[0],
      numbers: line.slice(2, -1).split('|'),
    }));
  }

  /**
   * 예치금 현황 조회
   */
  async getBalance(): Promise<BalanceInfo> {
    const headers = {
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: `${BASE_URL}/mypage/home`,
    };

    const resp = await this.fetch(
      `${BASE_URL}/mypage/selectUserMndp.do`,
      { headers },
    );
    const data = await resp.json() as {
      data?: {
        userMndp?: Record<string, number | null>;
      };
    };
    const m = data?.data?.userMndp ?? {};

    const totalDeposit =
      ((m.pntDpstAmt ?? 0) - (m.pntTkmnyAmt ?? 0)) +
      ((m.ncsblDpstAmt ?? 0) - (m.ncsblTkmnyAmt ?? 0)) +
      ((m.csblDpstAmt ?? 0) - (m.csblTkmnyAmt ?? 0));
    const purchasableAmount = m.crntEntrsAmt ?? 0;
    const reservedAmount = m.rsvtOrdrAmt ?? 0;
    const withdrawalPending = m.dawAplyAmt ?? 0;
    const nonPurchasable = reservedAmount + withdrawalPending + (m.feeAmt ?? 0);

    // 최근 1달 누적 구매금액
    let monthlyPurchaseTotal = 0;
    try {
      const resp2 = await this.fetch(
        `${BASE_URL}/mypage/selectMyHomeInfo.do`,
        { headers },
      );
      const data2 = await resp2.json() as {
        data?: { mnthPrchsAmt?: number };
      };
      monthlyPurchaseTotal = data2?.data?.mnthPrchsAmt ?? 0;
    } catch {
      // 무시
    }

    return {
      totalDeposit,
      purchasableAmount,
      reservedAmount,
      withdrawalPending,
      nonPurchasable,
      monthlyPurchaseTotal,
    };
  }

  /**
   * 구매 내역 조회
   */
  async getPurchaseHistory(
    startDate?: string,
    endDate?: string,
  ): Promise<PurchaseHistoryItem[]> {
    const kst = getKSTDate();
    const today = new Date(kst.getFullYear(), kst.getMonth(), kst.getDate());

    const startDt = startDate
      ? new Date(startDate)
      : new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const endDt = endDate ? new Date(endDate) : today;

    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    };

    const headers = {
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: 'https://www.dhlottery.co.kr/mypage/mylotteryledger',
    };

    // 먼저 내역 페이지 방문
    await this.fetch(`${BASE_URL}/mypage/mylotteryledger`, { headers });

    const params = new URLSearchParams({
      srchStrDt: fmt(startDt),
      srchEndDt: fmt(endDt),
      pageNum: '1',
      recordCountPerPage: '100',
      _: String(Date.now()),
    });

    const resp = await this.fetch(
      `${BASE_URL}/mypage/selectMyLotteryledger.do?${params.toString()}`,
      { headers },
    );

    const contentType = resp.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error('구매 내역 조회 실패: 세션이 만료되었을 수 있습니다.');
    }

    const responseData = await resp.json() as {
      data?: {
        list?: Array<{
          eltOrdrDt?: string;
          ltGdsNm?: string;
          ltEpsdView?: string;
          gmInfo?: string;
          prchsQty?: number;
          ltWnResult?: string;
          ntslOrdrNo?: string;
          ltWnAmt?: number;
          epsdRflDt?: string;
        }>;
      };
    };

    const items = responseData?.data?.list ?? [];
    const results: PurchaseHistoryItem[] = [];

    for (const item of items) {
      let numbers = item.gmInfo ?? '';

      // 로또 6/45 상세 조회
      if (item.ltGdsNm === '로또6/45' && item.ntslOrdrNo && item.gmInfo) {
        try {
          const detail = await this.getLotto645TicketDetail(
            item.ntslOrdrNo,
            item.gmInfo,
            item.eltOrdrDt ?? '',
          );
          numbers = detail;
        } catch {
          // 상세 조회 실패 시 기본 정보 사용
        }
        // 요청 간 딜레이
        await new Promise((r) => setTimeout(r, 500));
      }

      const winAmt = item.ltWnAmt ?? 0;
      results.push({
        purchaseDate: item.eltOrdrDt ?? '',
        lotteryName: item.ltGdsNm ?? '',
        roundNo: item.ltEpsdView ?? '',
        numbers,
        quantity: item.prchsQty ?? 0,
        winResult: item.ltWnResult ?? '',
        winAmount: winAmt > 0 ? `${winAmt.toLocaleString()}원` : '-',
        drawDate: item.epsdRflDt ?? '',
      });
    }

    return results;
  }

  private async getLotto645TicketDetail(
    ntslOrdrNo: string,
    barcode: string,
    purchaseDate: string,
  ): Promise<string> {
    const purchaseDt = new Date(purchaseDate);
    const startDate = new Date(purchaseDt.getTime() - 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(purchaseDt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    };

    const params = new URLSearchParams({
      ntslOrdrNo,
      srchStrDt: fmt(startDate),
      srchEndDt: fmt(endDate),
      barcd: barcode,
    });

    const resp = await this.fetch(
      `${BASE_URL}/mypage/lotto645TicketDetail.do?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    );

    const data = await resp.json() as {
      data?: {
        success?: boolean;
        ticket?: {
          game_dtl?: Array<{
            idx?: string;
            num?: number[];
            type?: number;
          }>;
        };
      };
    };

    if (!data?.data?.success) return '조회 실패';

    const gameDtl = data.data.ticket?.game_dtl ?? [];
    if (gameDtl.length === 0) return '번호 정보 없음';

    const typeMap: Record<number, string> = { 1: '수동', 2: '반자동', 3: '자동' };

    const result = gameDtl.map((game) => {
      const idx = game.idx ?? '';
      const nums = game.num ?? [];
      const gameType = typeMap[game.type ?? 3] ?? '자동';
      const numbersStr = nums.map((n) => String(n)).join(' ');
      return `[${idx}] ${gameType}: ${numbersStr}`;
    });

    return result.join('\n');
  }
}

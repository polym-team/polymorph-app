import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-utils';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const results: Record<string, unknown> = {};

  // 1. 외부 IP 확인
  try {
    const ipResp = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(5000) });
    results.publicIp = await ipResp.json();
  } catch (e) {
    results.publicIp = { error: e instanceof Error ? e.message : 'failed' };
  }

  // 2. DNS 확인 - 일반 사이트
  try {
    const start = Date.now();
    const resp = await fetch('https://www.google.com', { signal: AbortSignal.timeout(5000) });
    results.google = { status: resp.status, ms: Date.now() - start };
  } catch (e) {
    results.google = { error: e instanceof Error ? e.message : 'failed' };
  }

  // 3. 동행복권 메인 페이지
  try {
    const start = Date.now();
    const resp = await fetch('https://www.dhlottery.co.kr/', {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });
    results.dhlottery = { status: resp.status, ms: Date.now() - start, url: resp.url };
  } catch (e) {
    results.dhlottery = {
      error: e instanceof Error ? e.message : 'failed',
      cause: e instanceof Error && 'cause' in e ? String((e as { cause: unknown }).cause) : undefined,
    };
  }

  // 4. 동행복권 로그인 페이지
  try {
    const start = Date.now();
    const resp = await fetch('https://www.dhlottery.co.kr/login.do', {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });
    results.dhlotteryLogin = { status: resp.status, ms: Date.now() - start };
  } catch (e) {
    results.dhlotteryLogin = { error: e instanceof Error ? e.message : 'failed' };
  }

  // 5. DNS resolve 테스트
  try {
    const dns = await import('dns');
    const { resolve4 } = dns.promises;
    const addresses = await resolve4('www.dhlottery.co.kr');
    results.dns = { addresses };
  } catch (e) {
    results.dns = { error: e instanceof Error ? e.message : 'failed' };
  }

  return NextResponse.json(results);
}

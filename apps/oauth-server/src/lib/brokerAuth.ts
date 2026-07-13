import type { NextRequest } from 'next/server';
import { validateToken } from '@polymorph/shared-auth';

/**
 * 캘린더 브로커 API 공통 인증: 서버 간 시크릿(x-internal-secret) + polymorph JWT.
 * 성공 시 userId(sub)를 돌려준다.
 */
export type BrokerAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

export async function authenticateBroker(
  req: NextRequest,
): Promise<BrokerAuthResult> {
  const brokerSecret = process.env.CALENDAR_BROKER_SECRET;
  if (!brokerSecret || req.headers.get('x-internal-secret') !== brokerSecret) {
    return { ok: false, status: 403, error: 'forbidden' };
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;
  if (!token) {
    return { ok: false, status: 401, error: 'unauthorized' };
  }

  const result = await validateToken(token);
  if (!result.valid || !result.payload?.sub) {
    return { ok: false, status: 401, error: 'invalid_token' };
  }
  return { ok: true, userId: result.payload.sub };
}

export const dynamic = 'force-dynamic';

import { authenticateScope } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function unauthorized(status: 401 | 403): Response {
  return Response.json(
    { message: status === 401 ? '인증이 필요합니다.' : '권한이 없습니다.' },
    { status }
  );
}

interface DepositPayload {
  externalId?: unknown;
  bankAccount?: unknown;
  payerName?: unknown;
  amount?: unknown;
  balance?: unknown;
  txAt?: unknown;
  rawText?: unknown;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * POST /api/deposits — 브릿지 인그레스(scope=ingest).
 * externalId 기준 멱등 upsert. 이미 존재하면 created:false로 무시.
 */
export async function POST(req: Request): Promise<Response> {
  const auth = await authenticateScope(req, 'ingest');
  if (!auth.ok) return unauthorized(auth.status);

  let body: DepositPayload;
  try {
    body = (await req.json()) as DepositPayload;
  } catch {
    return Response.json({ message: '잘못된 JSON 본문입니다.' }, { status: 400 });
  }

  // 필수 필드 검증
  if (!isNonEmptyString(body.externalId)) {
    return Response.json({ message: 'externalId는 필수입니다.' }, { status: 400 });
  }
  if (!isNonEmptyString(body.payerName)) {
    return Response.json({ message: 'payerName은 필수입니다.' }, { status: 400 });
  }
  if (typeof body.amount !== 'number' || !Number.isInteger(body.amount) || body.amount <= 0) {
    return Response.json(
      { message: 'amount는 양의 정수(원)여야 합니다.' },
      { status: 400 }
    );
  }
  if (!isNonEmptyString(body.txAt)) {
    return Response.json({ message: 'txAt은 필수입니다.' }, { status: 400 });
  }
  const txAt = new Date(body.txAt);
  if (Number.isNaN(txAt.getTime())) {
    return Response.json(
      { message: 'txAt은 유효한 ISO8601 날짜여야 합니다.' },
      { status: 400 }
    );
  }
  if (!isNonEmptyString(body.rawText)) {
    return Response.json({ message: 'rawText는 필수입니다.' }, { status: 400 });
  }

  const balance =
    typeof body.balance === 'number' && Number.isInteger(body.balance)
      ? body.balance
      : null;
  const bankAccount = isNonEmptyString(body.bankAccount) ? body.bankAccount : null;

  // 멱등 처리: externalId가 이미 있으면 새로 만들지 않는다.
  const existing = await prisma.deposit.findUnique({
    where: { externalId: body.externalId },
    select: { id: true },
  });
  if (existing) {
    return Response.json({ created: false, id: existing.id });
  }

  try {
    const created = await prisma.deposit.create({
      data: {
        externalId: body.externalId,
        bankAccount,
        payerName: body.payerName,
        amount: body.amount,
        balance,
        txAt,
        rawText: body.rawText,
      },
      select: { id: true },
    });
    return Response.json({ created: true, id: created.id }, { status: 201 });
  } catch (error) {
    // 동시 요청으로 unique 충돌 시에도 멱등하게 응답
    const again = await prisma.deposit.findUnique({
      where: { externalId: body.externalId },
      select: { id: true },
    });
    if (again) return Response.json({ created: false, id: again.id });
    return Response.json(
      {
        message: '입금 적재 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 100;

/**
 * GET /api/deposits?from=<ISO>&to=<ISO>&cursor=<id>&limit=<n> — 소비자 조회(scope=read).
 * txAt 오름차순, id 커서 페이지네이션. mall이 externalId를 근거 id로 사용.
 */
export async function GET(req: Request): Promise<Response> {
  const auth = await authenticateScope(req, 'read');
  if (!auth.ok) return unauthorized(auth.status);

  const url = new URL(req.url);
  const fromRaw = url.searchParams.get('from');
  const toRaw = url.searchParams.get('to');
  const cursorRaw = url.searchParams.get('cursor');
  const limitRaw = url.searchParams.get('limit');

  const txAtFilter: { gte?: Date; lte?: Date } = {};
  if (fromRaw) {
    const from = new Date(fromRaw);
    if (Number.isNaN(from.getTime())) {
      return Response.json({ message: 'from이 유효하지 않습니다.' }, { status: 400 });
    }
    txAtFilter.gte = from;
  }
  if (toRaw) {
    const to = new Date(toRaw);
    if (Number.isNaN(to.getTime())) {
      return Response.json({ message: 'to가 유효하지 않습니다.' }, { status: 400 });
    }
    txAtFilter.lte = to;
  }

  let limit = DEFAULT_LIMIT;
  if (limitRaw) {
    const parsed = Number(limitRaw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return Response.json({ message: 'limit이 유효하지 않습니다.' }, { status: 400 });
    }
    limit = Math.min(parsed, MAX_LIMIT);
  }

  const cursor = cursorRaw ? Number(cursorRaw) : undefined;
  if (cursorRaw && (cursor === undefined || !Number.isInteger(cursor))) {
    return Response.json({ message: 'cursor가 유효하지 않습니다.' }, { status: 400 });
  }

  const rows = await prisma.deposit.findMany({
    where: Object.keys(txAtFilter).length ? { txAt: txAtFilter } : undefined,
    orderBy: { id: 'asc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      externalId: true,
      payerName: true,
      amount: true,
      txAt: true,
    },
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return Response.json({ items, nextCursor });
}

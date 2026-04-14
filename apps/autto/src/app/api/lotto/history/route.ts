import { NextResponse } from 'next/server';
import { requireAuth, createDhClient } from '@/lib/api-utils';

export async function GET(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const accountId = Number(searchParams.get('accountId'));
  if (!accountId) {
    return NextResponse.json({ error: 'accountId가 필요합니다.' }, { status: 400 });
  }

  const startDate = searchParams.get('startDate') ?? undefined;
  const endDate = searchParams.get('endDate') ?? undefined;

  const { client, error: clientError } = await createDhClient(accountId, user!.id);
  if (clientError) return clientError;

  const history = await client!.getPurchaseHistory(startDate, endDate);
  return NextResponse.json(history);
}

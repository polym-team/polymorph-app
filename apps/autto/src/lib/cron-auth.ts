import { NextResponse } from 'next/server';

export function verifyCronKey(req: Request) {
  const key = req.headers.get('x-cron-key');
  if (!key || key !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

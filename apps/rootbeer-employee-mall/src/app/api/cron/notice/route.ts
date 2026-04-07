import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronKey } from '@/lib/cron-auth';
import { loginAndGetSession } from '@/lib/scraper/amoremall-auth';
import { fetchAndScrapeNotices } from '@/lib/scraper/amoremall-notice';

export const maxDuration = 120;

export async function POST(req: Request) {
  const authError = verifyCronKey(req);
  if (authError) return authError;

  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;
  if (!id || !pw) {
    return NextResponse.json({ error: 'credentials missing' }, { status: 500 });
  }

  const session = await loginAndGetSession(id, pw);

  try {
    const existing = await prisma.notice.findMany({ select: { externalId: true } });
    const existingIds = new Set(existing.map((n) => n.externalId));

    const newNotices = await fetchAndScrapeNotices(session.token, session.context, existingIds);

    for (const notice of newNotices) {
      await prisma.notice.create({
        data: {
          externalId: notice.externalId,
          title: notice.title,
          content: notice.content,
          noticeDate: notice.noticeDate,
        },
      });
    }

    console.log(`[cron/notice] 신규 공지사항 ${newNotices.length}건 저장`);
    return NextResponse.json({ newCount: newNotices.length });
  } finally {
    await session.browser.close();
  }
}

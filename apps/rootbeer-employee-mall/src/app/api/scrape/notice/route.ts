import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-utils';
import { loginAndGetSession } from '@/lib/scraper/amoremall-auth';
import { fetchAndScrapeNotices } from '@/lib/scraper/amoremall-notice';

export const maxDuration = 120;

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = process.env.AMOREMALL_ID;
  const pw = process.env.AMOREMALL_PW;

  if (!id || !pw) {
    return NextResponse.json(
      { error: 'AMOREMALL_ID, AMOREMALL_PW 환경변수가 필요합니다' },
      { status: 500 },
    );
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

    return NextResponse.json({ total: newNotices.length, notices: newNotices.map((n) => ({ id: n.externalId, title: n.title })) });
  } finally {
    await session.browser.close();
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/comments?groupId=&urlKey=&status=open|resolved — 그룹 스코프 조회
export async function GET(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ error: 'groupId 가 필요합니다' }, { status: 400 });
  }
  const me = await getMembership(user, groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }

  const urlKey = searchParams.get('urlKey') ?? undefined;
  const statusParam = searchParams.get('status');
  const status =
    statusParam === 'open'
      ? 'OPEN'
      : statusParam === 'resolved'
        ? 'RESOLVED'
        : undefined;

  const comments = await prisma.comment.findMany({
    where: { groupId, urlKey, status },
    include: { replies: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ comments });
}

const CreateComment = z.object({
  groupId: z.string().min(1),
  pageUrl: z.string().min(1),
  urlKey: z.string().min(1),
  cssPath: z.string().min(1),
  classList: z.string().default(''),
  tagName: z.string().min(1),
  rect: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
  anchorHint: z.record(z.any()).optional(),
  body: z.string().min(1),
});

// POST /api/comments — 엘리먼트 코멘트 작성
export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const parsed = CreateComment.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: '입력이 올바르지 않습니다', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const me = await getMembership(user, data.groupId);
  if (!me) {
    return NextResponse.json({ error: '그룹 멤버가 아닙니다' }, { status: 403 });
  }

  const comment = await prisma.comment.create({
    data: {
      groupId: data.groupId,
      pageUrl: data.pageUrl,
      urlKey: data.urlKey,
      cssPath: data.cssPath,
      classList: data.classList,
      tagName: data.tagName,
      rect: data.rect,
      anchorHint: data.anchorHint,
      body: data.body,
      authorId: user.userId,
      authorName: user.name,
    },
  });
  return NextResponse.json({ comment }, { status: 201 });
}

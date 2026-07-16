import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { z } from 'zod';
import { validateToken } from '@polymorph/shared-auth';
import { prisma } from '@/lib/prisma';
import { getMembership, getMyGroupIds, type SessionUser } from '@/lib/auth';
import { computeSnapshotDiff } from '@/lib/snapshotDiff';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** authInfo.extra 에 담아둔 사용자 → SessionUser */
function userFrom(extra: unknown): SessionUser {
  const e = (extra || {}) as { userId?: string; email?: string; name?: string };
  return { userId: e.userId || '', email: e.email || '', name: e.name || '' };
}
const ok = (obj: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(obj, null, 2) }] });
const fail = (msg: string) => ({ content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true });

// 그룹 하나면 자동, 여러 개면 명시 요구(임의 선택 금지)
async function resolveGroupId(user: SessionUser, groupId?: string): Promise<string> {
  if (groupId) return groupId;
  const ids = await getMyGroupIds(user);
  if (ids.length === 0) throw new Error('속한 그룹이 없습니다.');
  if (ids.length > 1) {
    const groups = await prisma.group.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
    throw new Error('그룹이 여러 개입니다. groupId를 지정하세요: ' + groups.map((g) => `${g.name}(${g.id})`).join(', '));
  }
  return ids[0];
}

const baseHandler = createMcpHandler((server) => {
  server.registerTool(
    'list_unresolved_comments',
    {
      title: '미해결 코멘트 조회',
      description:
        '내가 속한 그룹의 미해결(OPEN) 코멘트를 urlKey(스토리)·selector·태그/클래스·본문과 함께 반환한다. groupId/urlKey 로 좁힐 수 있다.',
      inputSchema: { groupId: z.string().optional(), urlKey: z.string().optional() },
    },
    async ({ groupId, urlKey }, extra) => {
      try {
        const user = userFrom(extra.authInfo?.extra);
        const ids = groupId ? [groupId] : await getMyGroupIds(user);
        const rows = await prisma.comment.findMany({
          where: { groupId: { in: ids }, status: 'OPEN', urlKey: urlKey || undefined },
          include: { group: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return ok({
          count: rows.length,
          comments: rows.map((c) => ({
            id: c.id,
            group: c.group?.name,
            urlKey: c.urlKey,
            pageUrl: c.pageUrl,
            selector: c.cssPath,
            tag: c.tagName,
            body: c.body,
            author: c.authorName,
            createdAt: c.createdAt,
          })),
        });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'resolve_comment',
    {
      title: '코멘트 해결 처리',
      description: '코멘트를 RESOLVED 로 표시(수정 완료 후). 작성자는 상태를 바꿀 수 없다(비작성자만).',
      inputSchema: { id: z.string() },
    },
    async ({ id }, extra) => {
      try {
        const user = userFrom(extra.authInfo?.extra);
        const c = await prisma.comment.findUnique({ where: { id } });
        if (!c) throw new Error('코멘트를 찾을 수 없습니다');
        if (!(await getMembership(user, c.groupId))) throw new Error('그룹 멤버가 아닙니다');
        if (c.authorId === user.userId) throw new Error('작성자는 상태를 변경할 수 없습니다');
        const r = await prisma.comment.update({ where: { id }, data: { status: 'RESOLVED', resolvedAt: new Date() } });
        return ok({ resolved: r.id, status: r.status });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'add_reply',
    {
      title: '코멘트에 답글',
      description: '코멘트에 답글을 남긴다(진행 상황/질문 회신).',
      inputSchema: { id: z.string(), body: z.string() },
    },
    async ({ id, body }, extra) => {
      try {
        const user = userFrom(extra.authInfo?.extra);
        const c = await prisma.comment.findUnique({ where: { id } });
        if (!c) throw new Error('코멘트를 찾을 수 없습니다');
        if (!(await getMembership(user, c.groupId))) throw new Error('그룹 멤버가 아닙니다');
        const r = await prisma.commentReply.create({
          data: { commentId: id, body, authorId: user.userId, authorName: user.name },
        });
        return ok({ replyId: r.id });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'create_comment',
    {
      title: '스토리에 코멘트 생성',
      description:
        'Storybook 스토리에 새 코멘트를 남긴다(역방향 피드백/노트). 코드를 고치는 게 아니라 사람에게 남기는 메모다. ' +
        'urlKey·body·pageUrl 필수(pageUrl은 버전/빌드 추적용 정확한 스토리북 URL). cssPath로 특정 엘리먼트 지정 가능. 한 이슈=한 코멘트.',
      inputSchema: {
        urlKey: z.string(),
        body: z.string(),
        pageUrl: z.string(),
        groupId: z.string().optional(),
        cssPath: z.string().optional(),
        tagName: z.string().optional(),
      },
    },
    async ({ urlKey, body, pageUrl, groupId, cssPath, tagName }, extra) => {
      try {
        const user = userFrom(extra.authInfo?.extra);
        const gid = await resolveGroupId(user, groupId);
        if (!(await getMembership(user, gid))) throw new Error('그룹 멤버가 아닙니다');
        const c = await prisma.comment.create({
          data: {
            groupId: gid,
            urlKey,
            body,
            pageUrl,
            cssPath: cssPath ?? null,
            tagName: tagName ?? null,
            classList: '',
            authorId: user.userId,
            authorName: user.name,
          },
        });
        return ok({ created: c.id, urlKey, anchored: !!cssPath });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'get_tobe',
    {
      title: '스토리의 To-Be 변경 조회',
      description:
        '디자이너가 그린 To-Be(원본 대비 변경)를 {selector, kind, property, from, to} 목록 + 스토리북 버전으로 반환. 소스에 반영하는 데 사용. 변경 없으면 changeCount 0.',
      inputSchema: { urlKey: z.string(), groupId: z.string().optional() },
    },
    async ({ urlKey, groupId }, extra) => {
      try {
        const user = userFrom(extra.authInfo?.extra);
        const gid = await resolveGroupId(user, groupId);
        if (!(await getMembership(user, gid))) throw new Error('그룹 멤버가 아닙니다');
        const snap = await prisma.snapshot.findFirst({ where: { groupId: gid, urlKey, status: 'OPEN' } });
        if (!snap) return ok({ story: urlKey, changeCount: 0, changes: [] });
        const diff = computeSnapshotDiff(snap.originalHtml, snap.html);
        if (!diff) throw new Error('스냅샷이 rrweb JSON이 아닙니다(diff 불가)');
        return ok({
          story: urlKey,
          version: diff.version,
          editedBy: snap.createdByName,
          changeCount: diff.changes.length,
          changes: diff.changes,
        });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'resolve_tobe',
    {
      title: 'To-Be 완료 처리',
      description:
        '스토리의 진행 중(OPEN) To-Be를 완료 처리한다(소스에 반영한 뒤). 완료하면 디자이너가 새 스냅샷을 다시 만들 수 있다.',
      inputSchema: { urlKey: z.string(), groupId: z.string().optional() },
    },
    async ({ urlKey, groupId }, extra) => {
      try {
        const user = userFrom(extra.authInfo?.extra);
        const gid = await resolveGroupId(user, groupId);
        if (!(await getMembership(user, gid))) throw new Error('그룹 멤버가 아닙니다');
        const snap = await prisma.snapshot.findFirst({ where: { groupId: gid, urlKey, status: 'OPEN' } });
        if (!snap) throw new Error('진행 중인 To-Be 스냅샷이 없습니다.');
        const r = await prisma.snapshot.update({
          where: { id: snap.id },
          data: { status: 'RESOLVED', resolvedAt: new Date(), resolvedByName: user.name },
        });
        return ok({ resolved: r.id, status: r.status });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    },
  );
}, {}, { basePath: '/api' });

// Bearer JWT(oauth.polymorph.co.kr 발급, HS256) 검증 → 사용자 식별.
const verifyToken = async (_req: Request, bearer?: string): Promise<AuthInfo | undefined> => {
  if (!bearer) return undefined;
  const r = await validateToken(bearer);
  if (!r.valid || !r.payload?.sub || !r.payload.email) return undefined;
  return {
    token: bearer,
    clientId: r.payload.clientId || 'unknown',
    scopes: [],
    expiresAt: r.payload.exp,
    extra: { userId: r.payload.sub, email: r.payload.email, name: r.payload.name ?? '' },
  };
};

const handler = withMcpAuth(baseHandler, verifyToken, {
  required: true,
  resourceMetadataPath: '/.well-known/oauth-protected-resource',
});

export { handler as GET, handler as POST, handler as DELETE };

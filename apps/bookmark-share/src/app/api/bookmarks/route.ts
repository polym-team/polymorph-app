import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { Importance, Prisma } from '@prisma/client';

const createBookmarkSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  importance: z.nativeEnum(Importance).default('NORMAL'),
  accessInfo: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  isPinned: z.boolean().default(false),
  organizationId: z.string().cuid(),
});

const updateBookmarkSchema = createBookmarkSchema.partial().extend({
  id: z.string().cuid(),
});

// GET /api/bookmarks - List bookmarks
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId');
  const search = searchParams.get('search');
  const categoryId = searchParams.get('categoryId');
  const importance = searchParams.get('importance');
  const isPinned = searchParams.get('isPinned');
  const tags = searchParams.get('tags');

  if (!organizationId) {
    return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
  }

  // Verify user is member of organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
  }

  const where: Prisma.BookmarkWhereInput = {
    organizationId,
  };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { url: { contains: search } },
      { tags: { array_contains: search } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (importance) {
    where.importance = importance as Importance;
  }

  if (isPinned === 'true') {
    where.isPinned = true;
  }

  if (tags) {
    // MySQL Json doesn't support hasEvery, filter first tag only
    const tagList = tags.split(',');
    if (tagList.length > 0) {
      where.tags = { array_contains: tagList[0] };
    }
  }

  const bookmarks = await prisma.bookmark.findMany({
    where,
    include: {
      category: true,
      createdBy: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: [{ isPinned: 'desc' }, { importance: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json(bookmarks);
}

// POST /api/bookmarks - Create bookmark
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[POST /api/bookmarks] Request body:', JSON.stringify(body, null, 2));

    const result = createBookmarkSchema.safeParse(body);

    if (!result.success) {
      console.log('[POST /api/bookmarks] Validation error:', result.error.errors);
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const data = result.data;

    // Verify user is member of organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: data.organizationId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    // Verify category belongs to organization if provided
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          organizationId: data.organizationId,
        },
      });

      if (!category) {
        return NextResponse.json({ error: 'Category not found in this organization' }, { status: 400 });
      }
    }

    // Try to extract favicon
    let faviconUrl: string | undefined;
    try {
      const urlObj = new URL(data.url);
      faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      // Ignore favicon extraction errors
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        faviconUrl,
        tags: data.tags,
        importance: data.importance,
        accessInfo: data.accessInfo,
        notes: data.notes,
        isPinned: data.isPinned,
        organizationId: data.organizationId,
        categoryId: data.categoryId,
        createdById: user.id,
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error('[POST /api/bookmarks] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/bookmarks - Update bookmark
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = updateBookmarkSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const { id, ...data } = result.data;

  // Find the bookmark
  const existingBookmark = await prisma.bookmark.findUnique({
    where: { id },
  });

  if (!existingBookmark) {
    return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
  }

  // Verify user is member of organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: existingBookmark.organizationId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
  }

  const bookmark = await prisma.bookmark.update({
    where: { id },
    data,
    include: {
      category: true,
      createdBy: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  return NextResponse.json(bookmark);
}

// DELETE /api/bookmarks - Delete bookmark
export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const bookmark = await prisma.bookmark.findUnique({
    where: { id },
  });

  if (!bookmark) {
    return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
  }

  // Verify user is member of organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: bookmark.organizationId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
  }

  await prisma.bookmark.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

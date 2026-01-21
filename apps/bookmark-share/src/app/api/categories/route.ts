import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  organizationId: z.string().cuid(),
});

const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().cuid(),
});

// GET /api/categories - List categories
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId');

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

  const categories = await prisma.category.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(categories);
}

// POST /api/categories - Create category
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = createCategorySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const data = result.data;

  // Verify user is OWNER of organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: data.organizationId,
      },
    },
  });

  if (!membership || membership.role !== 'OWNER') {
    return NextResponse.json(
      { error: 'Only organization owners can create categories' },
      { status: 403 }
    );
  }

  // Check if slug already exists in this organization
  const existingCategory = await prisma.category.findUnique({
    where: {
      organizationId_slug: {
        organizationId: data.organizationId,
        slug: data.slug,
      },
    },
  });

  if (existingCategory) {
    return NextResponse.json(
      { error: 'A category with this slug already exists' },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data,
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  return NextResponse.json(category, { status: 201 });
}

// PATCH /api/categories - Update category
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = updateCategorySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.errors }, { status: 400 });
  }

  const { id, ...data } = result.data;

  // Find the category
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  // Verify user is OWNER of organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: existingCategory.organizationId,
      },
    },
  });

  if (!membership || membership.role !== 'OWNER') {
    return NextResponse.json(
      { error: 'Only organization owners can update categories' },
      { status: 403 }
    );
  }

  // Check if new slug already exists
  if (data.slug && data.slug !== existingCategory.slug) {
    const slugExists = await prisma.category.findUnique({
      where: {
        organizationId_slug: {
          organizationId: existingCategory.organizationId,
          slug: data.slug,
        },
      },
    });

    if (slugExists) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data,
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  return NextResponse.json(category);
}

// DELETE /api/categories - Delete category
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

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  // Verify user is OWNER of organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: category.organizationId,
      },
    },
  });

  if (!membership || membership.role !== 'OWNER') {
    return NextResponse.json(
      { error: 'Only organization owners can delete categories' },
      { status: 403 }
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

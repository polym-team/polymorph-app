import type { Bookmark, Category, Organization, User, Importance, MemberRole } from '@prisma/client';

export type { Bookmark, Category, Organization, User, Importance, MemberRole };

export interface BookmarkWithRelations extends Omit<Bookmark, 'tags'> {
  tags: string[];
  category?: Category | null;
  createdBy: User;
  organization: Organization;
}

export interface CategoryWithCount extends Category {
  _count: {
    bookmarks: number;
  };
}

export interface OrganizationWithRole extends Organization {
  role: MemberRole;
}

export interface BookmarkFormData {
  url: string;
  title: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  importance?: Importance;
  accessInfo?: string;
  notes?: string;
  isPinned?: boolean;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export interface BookmarkFilters {
  search?: string;
  categoryId?: string;
  tags?: string[];
  importance?: Importance[];
  isPinned?: boolean;
}

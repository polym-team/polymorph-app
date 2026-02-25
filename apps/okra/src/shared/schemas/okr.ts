import { z } from 'zod';

export const createOKRSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});

export const updateOKRSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
  startDate: z.string().datetime({ offset: true }).nullable().optional(),
  endDate: z.string().datetime({ offset: true }).nullable().optional(),
});

export const updateOKRStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'REVIEW', 'ARCHIVED']),
});

export const addOKROwnerSchema = z.object({
  userId: z.string().min(1),
});

// Idea schemas
export const createIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
});

export const updateIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  category: z.string().max(50).nullable().optional(),
});

// Objective schemas
export const createObjectiveSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  assigneeIds: z.array(z.string().min(1)).optional(),
});

export const updateObjectiveSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  assigneeIds: z.array(z.string().min(1)).optional(),
});

// OKR Progress schema
export const updateOKRProgressSchema = z.object({
  content: z.any(),
});

// Review schemas
export const createReviewSchema = z.object({ content: z.any() });
export const updateReviewSchema = z.object({ content: z.any() });

// Reorder schema (shared for ideas, objectives, tasks)
export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

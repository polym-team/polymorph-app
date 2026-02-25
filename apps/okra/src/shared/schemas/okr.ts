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
});

export const updateObjectiveSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  assigneeMode: z.enum(['ANYONE', 'ASSIGNED']).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  assigneeMode: z.enum(['ANYONE', 'ASSIGNED']).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'DISCARDED']).optional(),
});

// OKR Progress schema
export const updateOKRProgressSchema = z.object({
  content: z.any(),
});

// Reorder schema (shared for ideas, objectives, tasks)
export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

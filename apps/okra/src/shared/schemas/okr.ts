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

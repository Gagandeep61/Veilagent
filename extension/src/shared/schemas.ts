import { z } from 'zod';

export const UIElementZodSchema = z.object({
  element_id: z.string(),
  tag: z.string(),
  role: z.string(),
  label: z.string(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  visible: z.boolean(),
  disabled: z.boolean().default(false),
  type: z.string().optional(),
});

export const ActionResponseZodSchema = z.object({
  action: z.enum(['click', 'scroll', 'none']),
  element_id: z.string().nullable().optional(),
  x: z.number().nullable().optional(),
  y: z.number().nullable().optional(),
  direction: z.enum(['up', 'down']).nullable().optional(),
  amount: z.number().nullable().optional(),
  confidence: z.number().min(0).max(1),
  rationale: z.string().optional(),
});

export const AgentTaskRequestZodSchema = z.object({
  task: z.string().min(1).max(500),
  apiUrl: z.string().url().optional(),
});

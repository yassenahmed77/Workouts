import { z } from 'zod';
import { sanitizeText, sanitizeNotes } from '@/lib/sanitizer';

export const HabitTypeSchema = z.enum(['boolean', 'numeric', 'quit']);

export const HabitCategorySchema = z.enum([
  'Supplement',
  'Nutrition',
  'Recovery',
  'Lifestyle',
  'Mindset',
  'Fitness',
  'Quit / Break'
]);

export const QuitCategorySchema = z.enum([
  'smoking',
  'sugar',
  'caffeine',
  'screens',
  'vape',
  'alcohol',
  'sleep',
  'custom'
]);

export const RelapseRecordSchema = z.object({
  timestamp: z.string().datetime().or(z.string()),
  note: z.string().optional().transform((val) => (val ? sanitizeNotes(val) : undefined)),
  durationDays: z.number().nonnegative().optional()
});

export const QuitHabitConfigSchema = z.object({
  startedAt: z.string(),
  targetDays: z.number().int().positive().default(90),
  quitCategory: QuitCategorySchema.optional().default('custom'),
  cigarettesPerDay: z.number().nonnegative().optional(),
  pricePerPack: z.number().nonnegative().optional(),
  cigarettesPerPack: z.number().positive().optional().default(20),
  savingsPerDay: z.number().nonnegative().optional(),
  currency: z.string().max(10).optional().default('EGP'),
  avoidedUnitsPerDay: z.number().nonnegative().optional(),
  avoidedUnitLabel: z.string().max(50).optional().transform((val) => (val ? sanitizeText(val) : 'Units')),
  motivationReason: z.string().max(500).optional().transform((val) => (val ? sanitizeNotes(val) : undefined)),
  relapseHistory: z.array(RelapseRecordSchema).optional().default([])
});

export const UserHabitSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1, 'Title is required').max(100).transform(sanitizeText),
  category: HabitCategorySchema,
  type: HabitTypeSchema,
  targetValue: z.number().positive().default(1),
  unit: z.string().max(30).transform(sanitizeText),
  iconKey: z.string().min(1).max(50),
  color: z.string().min(1).max(30),
  createdAt: z.string(),
  quitConfig: QuitHabitConfigSchema.optional()
});

export const HabitDailyRecordSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  userId: z.string().min(1),
  value: z.number().nonnegative(),
  completed: z.boolean()
});

export type UserHabitInput = z.infer<typeof UserHabitSchema>;
export type QuitHabitConfigInput = z.infer<typeof QuitHabitConfigSchema>;
export type HabitDailyRecordInput = z.infer<typeof HabitDailyRecordSchema>;

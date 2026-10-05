import { z } from 'zod';
import { sanitizeText, sanitizeNotes } from '@/lib/sanitizer';

export const AlertPrioritySchema = z.enum(['CRITICAL', 'WARNING', 'INFO']);

export const AlertTypeSchema = z.enum([
  'CHECK_IN_OVERDUE',
  'UNREVIEWED_CHECK_IN',
  'NO_WORKOUT_PLAN',
  'NO_DIET_PLAN',
  'LOW_WORKOUT_ADHERENCE'
]);

export const TargetSubTabSchema = z.enum(['overview', 'checkins', 'workout', 'nutrition', 'logs']);

export const CoachAlertSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  clientName: z.string().min(1).transform(sanitizeText),
  clientAvatar: z.string().min(1),
  type: AlertTypeSchema,
  priority: AlertPrioritySchema,
  title: z.string().min(1).transform(sanitizeText),
  reason: z.string().min(1).transform(sanitizeNotes),
  timestamp: z.string(),
  actionLabel: z.string().min(1).transform(sanitizeText),
  targetSubTab: TargetSubTabSchema,
  resolved: z.boolean().optional().default(false)
});

export type CoachAlertInput = z.infer<typeof CoachAlertSchema>;

/**
 * Workouts Pro — Client Domain Zod Schemas & Validation Contracts
 * 
 * Enforces runtime validation, bounds checking, and input sanitization
 * for all athlete/client-related operations.
 */

import { z } from 'zod';
import { sanitizeString, sanitizeNotes } from '@/lib/sanitizer';

// Reusable Goal Schema matching UserGoal
export const UserGoalSchema = z.enum([
  'Hypertrophy / Muscle Gain',
  'Strength & Power',
  'Fat Loss & Conditioning',
  'Athletic Performance',
  'Rehabilitation & Mobility'
]);

// Subscription Plan Type Schema
export const SubscriptionPlanTypeSchema = z.enum([
  'Full VIP Coaching',
  'Workout Only',
  'Nutrition Only',
  'Contest Prep',
  'Custom Coaching'
]);

// Subscription Status Schema
export const SubscriptionStatusSchema = z.enum([
  'active',
  'expiring_soon',
  'expired'
]);

// Client Subscription Schema
export const ClientSubscriptionSchema = z.object({
  planType: SubscriptionPlanTypeSchema,
  durationMonths: z.number().int().min(1).max(36),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  price: z.number().nonnegative().optional(),
  currency: z.string().max(5).default('EGP'),
  status: SubscriptionStatusSchema,
  notes: z.string().max(500).optional().transform((v) => (v ? sanitizeNotes(v) : undefined))
});

// Attention Note Schema
export const AttentionNoteSchema = z.object({
  type: z.enum(['danger', 'warning', 'info', 'none']),
  label: z.string().max(100).transform(sanitizeString),
  timeframe: z.string().max(50).transform(sanitizeString)
});

// Schema for Creating a New Trainee/Client
export const ClientCreateSchema = z.object({
  coachId: z.string().optional(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must not exceed 60 characters')
    .transform(sanitizeString),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  phone: z
    .string()
    .max(25)
    .optional()
    .transform((v) => (v ? sanitizeString(v) : undefined)),
  gender: z.enum(['Male', 'Female']).default('Male'),
  age: z.number().int().min(12, 'Age must be at least 12').max(100, 'Age must be under 100').optional(),
  heightCm: z
    .number()
    .min(100, 'Height must be at least 100 cm')
    .max(250, 'Height must be under 250 cm'),
  weightKg: z
    .number()
    .min(30, 'Weight must be at least 30 kg')
    .max(300, 'Weight must be under 300 kg'),
  targetWeightKg: z
    .number()
    .min(30, 'Target weight must be at least 30 kg')
    .max(300, 'Target weight must be under 300 kg'),
  goal: UserGoalSchema,
  status: z.enum(['active', 'pending', 'inactive', 'on_hold']).default('active'),
  bodyFatPercentage: z.number().min(3).max(60).optional(),
  notes: z.string().max(2000).optional().transform((v) => (v ? sanitizeNotes(v) : undefined)),
  isCompetitor: z.boolean().default(false),
  assignedPlanId: z.string().optional(),
  assignedDietPlanId: z.string().optional(),
  subscription: ClientSubscriptionSchema.optional()
});

// Schema for Updating an Existing Trainee/Client
export const ClientUpdateSchema = ClientCreateSchema.partial().extend({
  id: z.string().min(1, 'Client ID is required')
});

// Schema for Updating Coach Notes
export const ClientNoteUpdateSchema = z.object({
  clientId: z.string().min(1),
  privateCoachNotes: z.string().max(3000).transform(sanitizeNotes)
});

// Type inferences
export type ClientCreateInput = z.infer<typeof ClientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof ClientUpdateSchema>;
export type ClientSubscriptionInput = z.infer<typeof ClientSubscriptionSchema>;

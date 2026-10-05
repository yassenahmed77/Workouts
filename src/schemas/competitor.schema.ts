import { z } from 'zod';
import { sanitizeText, sanitizeNotes } from '@/lib/sanitizer';

export const CompetitorDivisionSchema = z.enum([
  'Classic Physique',
  "Men's Physique",
  'Open Bodybuilding',
  'Bikini Pro',
  'Figure'
]);

export const PrepPhaseSchema = z.enum([
  'Off-Season',
  'Prep Phase (16w)',
  'Cutting Phase (8w)',
  'Peak Week',
  'Show Day'
]);

export const PosingApprovalSchema = z.enum(['Approved', 'Needs Work', 'Pending Review']);

export const MandatoryPhotosSchema = z.object({
  frontUrl: z.string().url().or(z.literal('')).optional(),
  backUrl: z.string().url().or(z.literal('')).optional(),
  sideUrl: z.string().url().or(z.literal('')).optional(),
  legsUrl: z.string().url().or(z.literal('')).optional()
});

export const CompetitorProfileSchema = z.object({
  targetShow: z.string().min(1, 'Target show is required').max(150).transform(sanitizeText),
  showDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').or(z.string()),
  division: CompetitorDivisionSchema,
  targetWeightClassKg: z.number().positive(),
  currentWeightKg: z.number().positive(),
  prepPhase: PrepPhaseSchema,
  stageReadinessScore: z.number().min(0).max(100).default(75),
  posingApproval: PosingApprovalSchema.default('Pending Review'),
  daysOut: z.number().int().default(30),
  waterIntakeLiters: z.number().nonnegative().default(4),
  carbLoadGrams: z.number().nonnegative().default(300),
  sodiumProtocol: z.string().max(200).optional().transform((val) => (val ? sanitizeText(val) : undefined)),
  stageNotes: z.string().max(1000).optional().transform((val) => (val ? sanitizeNotes(val) : undefined)),
  privateCoachNotes: z.string().max(2000).optional().transform((val) => (val ? sanitizeNotes(val) : undefined)),
  mandatoryPhotos: MandatoryPhotosSchema.optional()
});

export type CompetitorProfileInput = z.infer<typeof CompetitorProfileSchema>;

import { z } from 'zod';
import { sanitizeText, sanitizeNotes, isValidPhoneNumber } from '@/lib/sanitizer';

export const CoachPackageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Package name is required').max(100).transform(sanitizeText),
  durationMonths: z.number().int().positive().default(1),
  price: z.number().nonnegative().default(0),
  description: z.string().max(1000).transform(sanitizeNotes),
  isPopular: z.boolean().optional().default(false)
});

export const CoachSettingsSchema = z.object({
  coachName: z.string().min(1, 'Coach name is required').max(100).transform(sanitizeText),
  brandName: z.string().min(1, 'Brand name is required').max(100).transform(sanitizeText),
  tagline: z.string().max(200).transform(sanitizeText),
  whatsappNumber: z.string().refine((val) => !val || isValidPhoneNumber(val), {
    message: 'Invalid phone number format'
  }).transform(sanitizeText),
  email: z.string().email('Invalid email address').or(z.literal('')).transform(sanitizeText),
  currency: z.enum(['EGP', 'USD', 'SAR', 'AED', 'EUR', 'GBP']).default('EGP'),
  renewalReminderDaysBefore: z.number().int().min(1).max(30).default(3),
  checkInDays: z.array(z.string()).default(['Friday', 'Sunday']),
  packages: z.array(CoachPackageSchema).default([])
});

export type CoachPackageInput = z.infer<typeof CoachPackageSchema>;
export type CoachSettingsInput = z.infer<typeof CoachSettingsSchema>;

import { Exercise, User, WorkoutPlan, WorkoutLog } from '@/types';

export const INITIAL_EXERCISES: Exercise[] = [];

export const INITIAL_USERS: User[] = [
  {
    id: 'coach-1',
    name: 'Yassen Ahmed',
    email: 'yassen.ahmed@fitness.io',
    role: 'coach',
    avatarText: 'YA',
    status: 'active',
    joinedDate: '2024-01-01',
    heightCm: 180,
    weightKg: 80,
    targetWeightKg: 80,
    goal: 'Athletic Performance',
    notes: 'System Admin & Trainer.'
  },
  {
    id: 'user-rawan-1',
    name: 'Rawan Ahmed',
    email: 'rawan.ahmed@fitness.io',
    role: 'trainee',
    avatarText: 'RA',
    status: 'pending',
    joinedDate: '2024-08-01',
    heightCm: 165,
    weightKg: 60,
    targetWeightKg: 58,
    goal: 'Fat Loss & Conditioning',
    notes: 'Rawan Ahmed customized athlete profile.'
  }
];

export const INITIAL_PLANS: WorkoutPlan[] = [];

export const INITIAL_LOGS: WorkoutLog[] = [];

import { Exercise, User, WorkoutPlan, WorkoutLog } from '@/types';

export const INITIAL_EXERCISES: Exercise[] = [
  { id: 'ex-1', name: 'Barbell Bench Press', targetMuscle: 'Chest', equipment: 'Barbell', category: 'Compound', executionCue: 'Retract scapulae and control eccentric descent.', tips: ['Keep feet planted', 'Touch mid chest', 'Drive through legs'], videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
  { id: 'ex-2', name: 'Incline Bench Press', targetMuscle: 'Chest', equipment: 'Dumbbell', category: 'Compound', executionCue: 'Set bench to 30 degrees for upper pectoral focus.', tips: ['Slight arch in lower back', 'Squeeze chest at top'], videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8' },
  { id: 'ex-3', name: 'Dumbbell Chest Flyes', targetMuscle: 'Chest', equipment: 'Dumbbell', category: 'Isolation', executionCue: 'Slight bend in elbows, feel chest stretch.', tips: ['Do not overstretch', 'Control the eccentric'], videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0' },
  { id: 'ex-4', name: 'Lat Pulldown', targetMuscle: 'Back', equipment: 'Cable', category: 'Compound', executionCue: 'Pull to upper sternum while depressing shoulders.', tips: ['Drive elbows down', 'Do not lean back excessively'], videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
  { id: 'ex-5', name: 'Seated Cable Row', targetMuscle: 'Back', equipment: 'Cable', category: 'Compound', executionCue: 'Pull handle into belly button with proud chest.', tips: ['Squeeze rhomboids', 'Keep spine tall'], videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033fBo' },
  { id: 'ex-6', name: 'Overhead Barbell Press', targetMuscle: 'Shoulders', equipment: 'Barbell', category: 'Compound', executionCue: 'Press bar overhead locking arms with core braced.', tips: ['Glutes tight', 'Head moves forward at top'], videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI' },
  { id: 'ex-7', name: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', equipment: 'Dumbbell', category: 'Isolation', executionCue: 'Lead with elbows slightly in the scapular plane.', tips: ['No swinging', 'Controlled lowering'], videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo' },
  { id: 'ex-8', name: 'Incline Bicep Curl', targetMuscle: 'Arms', equipment: 'Dumbbell', category: 'Isolation', executionCue: 'Full stretch at bottom, curl without swinging.', tips: ['Supinate wrists', 'Keep elbows fixed'], videoUrl: 'https://www.youtube.com/watch?v=soxrZlIl35U' },
  { id: 'ex-9', name: 'Cable Tricep Pushdown', targetMuscle: 'Arms', equipment: 'Cable', category: 'Isolation', executionCue: 'Pin elbows to ribs and lock out triceps.', tips: ['Flared elbows take tension off triceps'], videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU' },
  { id: 'ex-10', name: 'Barbell Squat', targetMuscle: 'Quads', equipment: 'Barbell', category: 'Compound', executionCue: 'Break at knees and hips simultaneously with neutral spine.', tips: ['Brace core 360 degrees', 'Knees track over toes'], videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8' },
  { id: 'ex-11', name: 'Leg Extension', targetMuscle: 'Quads', equipment: 'Machine', category: 'Isolation', executionCue: 'Extend legs to full knee lockout and pause.', tips: ['Point toes slightly up', 'Hold for 1s at top'], videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0' },
  { id: 'ex-12', name: 'Romanian Deadlift', targetMuscle: 'Hamstrings', equipment: 'Barbell', category: 'Compound', executionCue: 'Push hips back with soft knees until hamstring stretch.', tips: ['Keep bar close to shins', 'Flat spine'], videoUrl: 'https://www.youtube.com/watch?v=_oyxCn2iSjU' },
  { id: 'ex-13', name: 'Lying Leg Curl', targetMuscle: 'Hamstrings', equipment: 'Machine', category: 'Isolation', executionCue: 'Curl weight towards glutes keeping hips down.', tips: ['Do not lift hips off pad'], videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs' },
  { id: 'ex-14', name: 'Hanging Leg Raises', targetMuscle: 'Core', equipment: 'Bodyweight', category: 'Isolation', executionCue: 'Curl pelvis up towards chest, avoiding swing.', tips: ['Posterior pelvic tilt', 'Exhale at top'], videoUrl: 'https://www.youtube.com/watch?v=hdng3Nm1x_E' }
];

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
    notes: 'Head Coach & Training Program Designer.'
  },
  {
    id: 'user-rawan-1',
    name: 'Rawan Ahmed',
    email: 'rawan.ahmed@fitness.io',
    role: 'trainee',
    avatarText: 'RA',
    status: 'active',
    joinedDate: '2024-08-01',
    heightCm: 165,
    weightKg: 69,
    targetWeightKg: 60,
    goal: 'Fat Loss & Conditioning',
    notes: 'Awaiting customized workout protocol.'
  }
];

export const INITIAL_PLANS: WorkoutPlan[] = [];

export const INITIAL_LOGS: WorkoutLog[] = [];

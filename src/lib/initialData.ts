import { Exercise, User, WorkoutPlan, WorkoutLog, WeeklyCheckIn, DietPlan, FormCheckVideo, CoachSettings } from '@/types';

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
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
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
    email: 'rawan@email.com',
    phone: '+201023456789',
    role: 'trainee',
    avatarText: 'RA',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    gender: 'Female',
    age: 24,
    status: 'active',
    joinedDate: '2024-08-01',
    heightCm: 165,
    weightKg: 67.8,
    targetWeightKg: 60.0,
    goal: 'Fat Loss & Conditioning',
    notes: 'Lifestyle transformation athlete.',
    assignedPlanId: 'plan-upper-lower',
    assignedDietPlanId: 'diet-1',
    currentSplitProgress: 'Week 3 • Day 2',
    nutritionAdherence: 87,
    attentionNote: {
      type: 'warning',
      label: 'Late Check-in',
      timeframe: '2 days'
    },
    lastCheckInDate: '2026-09-14',
    subscription: {
      planType: 'Full VIP Coaching',
      durationMonths: 3,
      startDate: '2026-07-01',
      endDate: '2026-10-01',
      price: 4500,
      currency: 'EGP',
      status: 'active',
      notes: 'Renewing next week'
    }
  },
  {
    id: 'user-omar-2',
    name: 'Omar Hassan',
    email: 'omar@email.com',
    phone: '+201012345678',
    role: 'trainee',
    avatarText: 'OH',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    gender: 'Male',
    age: 28,
    status: 'active',
    joinedDate: '2024-07-15',
    heightCm: 178,
    weightKg: 78.4,
    targetWeightKg: 75.0,
    goal: 'Hypertrophy / Muscle Gain',
    notes: 'Hypertrophy client focusing on upper chest and shoulder width.',
    assignedPlanId: 'plan-ppl',
    assignedDietPlanId: 'diet-2',
    currentSplitProgress: 'Week 1 • Day 4',
    nutritionAdherence: 92,
    attentionNote: {
      type: 'info',
      label: 'Photos Due',
      timeframe: '12 days'
    },
    lastCheckInDate: '2026-09-16',
    subscription: {
      planType: 'Workout Only',
      durationMonths: 1,
      startDate: '2026-08-28',
      endDate: '2026-09-28',
      price: 1800,
      currency: 'EGP',
      status: 'expiring_soon',
      notes: 'Renewal due in 4 days'
    }
  },
  {
    id: 'user-sara-3',
    name: 'Sara Mohamed',
    email: 'sara@email.com',
    phone: '+201198765432',
    role: 'trainee',
    avatarText: 'SM',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    gender: 'Female',
    age: 26,
    status: 'active',
    joinedDate: '2024-06-10',
    heightCm: 162,
    weightKg: 62.1,
    targetWeightKg: 55.0,
    goal: 'Fat Loss & Conditioning',
    notes: 'Recomp and tone focus.',
    assignedPlanId: 'plan-fullbody',
    assignedDietPlanId: 'diet-1',
    currentSplitProgress: 'Week 2 • Day 3',
    nutritionAdherence: 63,
    attentionNote: {
      type: 'warning',
      label: 'Diet Off Track',
      timeframe: '63%'
    },
    lastCheckInDate: '2026-09-15',
    subscription: {
      planType: 'Nutrition Only',
      durationMonths: 3,
      startDate: '2026-09-15',
      endDate: '2026-12-15',
      price: 2400,
      currency: 'EGP',
      status: 'active'
    }
  },
  {
    id: 'user-ahmed-4',
    name: 'Ahmed Ali',
    email: 'ahmed@email.com',
    phone: '+201234567890',
    role: 'trainee',
    avatarText: 'AA',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    gender: 'Male',
    age: 31,
    status: 'pending',
    joinedDate: '2026-09-24',
    heightCm: 182,
    weightKg: 85.7,
    targetWeightKg: 80.0,
    goal: 'Fat Loss & Conditioning',
    notes: 'New athlete onboarded today; awaiting baseline check-in.',
    assignedDietPlanId: 'diet-3',
    nutritionAdherence: 56,
    attentionNote: {
      type: 'danger',
      label: 'Late Check-in',
      timeframe: '4 days'
    },
    lastCheckInDate: '2026-09-12',
    subscription: {
      planType: 'Full VIP Coaching',
      durationMonths: 1,
      startDate: '2026-09-24',
      endDate: '2026-10-24',
      price: 2500,
      currency: 'EGP',
      status: 'active',
      notes: 'Joined today'
    }
  },
  {
    id: 'user-laila-5',
    name: 'Laila Ahmed',
    email: 'laila@email.com',
    role: 'trainee',
    avatarText: 'LA',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    gender: 'Female',
    age: 22,
    status: 'active',
    joinedDate: '2024-05-18',
    heightCm: 168,
    weightKg: 59.3,
    targetWeightKg: 52.0,
    goal: 'Athletic Performance',
    notes: 'Glutes and posterior chain specialization.',
    assignedPlanId: 'plan-glutes',
    assignedDietPlanId: 'diet-1',
    currentSplitProgress: 'Week 3 • Day 1',
    nutritionAdherence: 90,
    attentionNote: {
      type: 'info',
      label: 'Plan Ending',
      timeframe: '3 days'
    },
    lastCheckInDate: '2026-09-16',
    subscription: {
      planType: 'Full VIP Coaching',
      durationMonths: 6,
      startDate: '2026-03-26',
      endDate: '2026-09-26',
      price: 8000,
      currency: 'EGP',
      status: 'expiring_soon',
      notes: 'Expires in 2 days'
    }
  },
  {
    id: 'user-mahmoud-6',
    name: 'Mahmoud Khaled',
    email: 'mahmoud@email.com',
    role: 'trainee',
    avatarText: 'MK',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    gender: 'Male',
    age: 27,
    status: 'active',
    joinedDate: '2024-04-01',
    heightCm: 185,
    weightKg: 92.6,
    targetWeightKg: 88.0,
    goal: 'Strength & Power',
    notes: 'Powerbuilding athlete focusing on deadlift and squat strength.',
    assignedPlanId: 'plan-ppl',
    assignedDietPlanId: 'diet-2',
    currentSplitProgress: 'Week 2 • Day 5',
    nutritionAdherence: 88,
    attentionNote: {
      type: 'none',
      label: 'All Good',
      timeframe: ''
    },
    lastCheckInDate: '2026-09-14',
    subscription: {
      planType: 'Workout Only',
      durationMonths: 3,
      startDate: '2026-09-10',
      endDate: '2026-12-10',
      price: 3600,
      currency: 'EGP',
      status: 'active'
    }
  },
  {
    id: 'user-nour-7',
    name: 'Nour El Din',
    email: 'nour@email.com',
    role: 'trainee',
    avatarText: 'NE',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    gender: 'Female',
    age: 29,
    status: 'active',
    joinedDate: '2024-06-25',
    heightCm: 160,
    weightKg: 56.8,
    targetWeightKg: 50.0,
    goal: 'Fat Loss & Conditioning',
    notes: 'Strict tracking client; renewing nutrition targets next cycle.',
    assignedPlanId: 'plan-fullbody',
    currentSplitProgress: 'Week 2 • Day 2',
    nutritionAdherence: 91,
    attentionNote: {
      type: 'warning',
      label: 'Diet Ending',
      timeframe: '5 days'
    },
    lastCheckInDate: '2026-09-13',
    subscription: {
      planType: 'Nutrition Only',
      durationMonths: 1,
      startDate: '2026-09-01',
      endDate: '2026-10-01',
      price: 1500,
      currency: 'EGP',
      status: 'active'
    }
  },
  {
    id: 'user-tarek-gamal-8',
    name: 'Tarek Gamal',
    email: 'tarek@email.com',
    role: 'trainee',
    avatarText: 'TG',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    gender: 'Male',
    age: 34,
    status: 'on_hold',
    joinedDate: '2024-03-10',
    heightCm: 176,
    weightKg: 81.2,
    targetWeightKg: 78.0,
    goal: 'Hypertrophy / Muscle Gain',
    notes: 'Temporarily on hold due to work travel; check-in overdue.',
    assignedPlanId: 'plan-upper-lower',
    assignedDietPlanId: 'diet-3',
    currentSplitProgress: 'Week 1 • Day 3',
    nutritionAdherence: 48,
    attentionNote: {
      type: 'danger',
      label: 'No Check-in',
      timeframe: '7 days'
    },
    lastCheckInDate: '2026-09-10',
    subscription: {
      planType: 'Full VIP Coaching',
      durationMonths: 3,
      startDate: '2026-06-20',
      endDate: '2026-09-20',
      price: 4500,
      currency: 'EGP',
      status: 'expired',
      notes: 'Expired 4 days ago'
    }
  },
  {
    id: 'user-tarek-1',
    name: 'Tarek El-Sayed',
    email: 'tarek.classic@fitness.io',
    role: 'trainee',
    avatarText: 'TS',
    avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    gender: 'Male',
    age: 29,
    status: 'active',
    joinedDate: '2024-02-15',
    heightCm: 178,
    weightKg: 84.8,
    targetWeightKg: 84.0,
    goal: 'Hypertrophy / Muscle Gain',
    notes: 'National caliber Classic Physique competitor.',
    isCompetitor: true,
    assignedPlanId: 'plan-ppl',
    assignedDietPlanId: 'diet-2',
    currentSplitProgress: 'Week 6 • Day 3',
    nutritionAdherence: 96,
    subscription: {
      planType: 'Contest Prep',
      durationMonths: 6,
      startDate: '2026-05-01',
      endDate: '2026-11-01',
      price: 12000,
      currency: 'EGP',
      status: 'active'
    },
    privateCoachNotes: 'Conditioning peeling on schedule. Glute-ham tie-in visible. Holding minor water in lower back. Drop sodium by 20% on Wednesday. Mindset is disciplined.',
    competitionProfile: {
      targetShow: 'NPC Egypt Muscle Showdown',
      showDate: '2026-10-05',
      division: 'Classic Physique',
      targetWeightClassKg: 84.0,
      currentWeightKg: 84.8,
      prepPhase: 'Peak Week',
      stageReadinessScore: 94,
      posingApproval: 'Approved',
      daysOut: 18,
      waterIntakeLiters: 6.5,
      carbLoadGrams: 420,
      sodiumProtocol: '2,400 mg daily baseline; taper starts 4 days out',
      stageNotes: 'Lock the abdominal vacuum for a full 3 seconds before hitting front double bicep.',
      privateCoachNotes: 'Conditioning peeling on schedule. Glute-ham tie-in visible. Holding minor water in lower back. Drop sodium by 20% on Wednesday. Mindset is disciplined.',
      mandatoryPhotos: {
        frontUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
        backUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
        sideUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
        legsUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80'
      }
    }
  },
  {
    id: 'user-karim-2',
    name: 'Karim Mansour',
    email: 'karim.physique@fitness.io',
    role: 'trainee',
    avatarText: 'KM',
    avatarUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    gender: 'Male',
    age: 26,
    status: 'active',
    joinedDate: '2024-03-01',
    heightCm: 174,
    weightKg: 76.2,
    targetWeightKg: 75.0,
    goal: 'Athletic Performance',
    notes: 'Pro Qualifier contender in Men\'s Physique.',
    isCompetitor: true,
    assignedPlanId: 'plan-upper-lower',
    assignedDietPlanId: 'diet-2',
    currentSplitProgress: 'Week 4 • Day 2',
    nutritionAdherence: 94,
    subscription: {
      planType: 'Contest Prep',
      durationMonths: 3,
      startDate: '2026-07-20',
      endDate: '2026-10-20',
      price: 8500,
      currency: 'EGP',
      status: 'active'
    },
    privateCoachNotes: 'V-taper looks championship grade. Upper chest density responding well to incline volume. Keep cardio at 35 min morning LISS.',
    competitionProfile: {
      targetShow: 'Dubai Pro Qualifier',
      showDate: '2026-10-19',
      division: "Men's Physique",
      targetWeightClassKg: 75.0,
      currentWeightKg: 76.2,
      prepPhase: 'Cutting Phase (8w)',
      stageReadinessScore: 88,
      posingApproval: 'Pending Review',
      daysOut: 32,
      waterIntakeLiters: 5.5,
      carbLoadGrams: 280,
      sodiumProtocol: 'Steady 3,000 mg baseline with potassium balance',
      stageNotes: 'Transition between quarter turns must be relaxed and fluid.',
      privateCoachNotes: 'V-taper looks championship grade. Upper chest density responding well to incline volume. Keep cardio at 35 min morning LISS.',
      mandatoryPhotos: {
        frontUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        backUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
        sideUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
        legsUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80'
      }
    }
  },
  {
    id: 'user-mostafa-3',
    name: 'Mostafa Kamal',
    email: 'mostafa.heavy@fitness.io',
    role: 'trainee',
    avatarText: 'MK',
    avatarUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    gender: 'Male',
    age: 30,
    status: 'active',
    joinedDate: '2024-01-10',
    heightCm: 182,
    weightKg: 97.5,
    targetWeightKg: 92.0,
    goal: 'Hypertrophy / Muscle Gain',
    notes: 'Heavyweight Open division competitor.',
    isCompetitor: true,
    assignedPlanId: 'plan-ppl',
    assignedDietPlanId: 'diet-2',
    currentSplitProgress: 'Week 8 • Day 1',
    nutritionAdherence: 90,
    subscription: {
      planType: 'Contest Prep',
      durationMonths: 6,
      startDate: '2026-06-01',
      endDate: '2026-12-01',
      price: 12000,
      currency: 'EGP',
      status: 'active'
    },
    privateCoachNotes: 'Huge structure. Hamstring cross-striations starting to emerge. Watch lower back pumps during leg day.',
    competitionProfile: {
      targetShow: 'Egypt National Championship',
      showDate: '2026-11-20',
      division: 'Open Bodybuilding',
      targetWeightClassKg: 92.0,
      currentWeightKg: 97.5,
      prepPhase: 'Prep Phase (16w)',
      stageReadinessScore: 82,
      posingApproval: 'Needs Work',
      daysOut: 64,
      waterIntakeLiters: 7.0,
      carbLoadGrams: 360,
      sodiumProtocol: 'Normal baseline 3,500 mg',
      stageNotes: 'Most muscular pose needs wider trap flare and deeper quad quad sweep.',
      privateCoachNotes: 'Huge structure. Hamstring cross-striations starting to emerge. Watch lower back pumps during leg day.',
      mandatoryPhotos: {
        frontUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
        backUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
        sideUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
        legsUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80'
      }
    }
  }
];

export const INITIAL_PLANS: WorkoutPlan[] = [
  {
    id: 'plan-upper-lower',
    title: 'Upper / Lower',
    description: '4-day undulating upper/lower split focusing on progressive overload and balanced mechanical tension.',
    level: 'Intermediate',
    daysPerWeek: 4,
    durationWeeks: 8,
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01',
    days: [
      {
        id: 'd-1',
        dayName: 'Upper Body A - Power',
        isRestDay: false,
        targetMuscles: ['Chest', 'Back', 'Arms'],
        estimatedMinutes: 60,
        exercises: [
          { id: 're-1', exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', targetMuscle: 'Chest', equipment: 'Barbell', sets: 4, targetReps: '6-8', targetRpe: 8, restSeconds: 120, alternativeExercise: 'Dumbbell Bench Press' },
          { id: 're-2', exerciseId: 'ex-4', exerciseName: 'Lat Pulldown', targetMuscle: 'Back', equipment: 'Cable', sets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { id: 're-3', exerciseId: 'ex-2', exerciseName: 'Incline Bench Press', targetMuscle: 'Chest', equipment: 'Dumbbell', sets: 3, targetReps: '8-12', targetRpe: 8.5, restSeconds: 90, alternativeExercise: 'Incline Dumbbell Press' },
          { id: 're-4', exerciseId: 'ex-5', exerciseName: 'Seated Cable Row', targetMuscle: 'Back', equipment: 'Cable', sets: 3, targetReps: '10-12', targetRpe: 8.5, restSeconds: 75 }
        ]
      },
      {
        id: 'd-2',
        dayName: 'Lower Body A - Quad Focus',
        isRestDay: false,
        targetMuscles: ['Quads', 'Hamstrings', 'Core'],
        estimatedMinutes: 65,
        exercises: [
          { id: 're-5', exerciseId: 'ex-10', exerciseName: 'Barbell Squat', targetMuscle: 'Quads', equipment: 'Barbell', sets: 4, targetReps: '6-8', targetRpe: 8, restSeconds: 150 },
          { id: 're-6', exerciseId: 'ex-12', exerciseName: 'Romanian Deadlift', targetMuscle: 'Hamstrings', equipment: 'Barbell', sets: 3, targetReps: '8-10', targetRpe: 8, restSeconds: 120 },
          { id: 're-7', exerciseId: 'ex-11', exerciseName: 'Leg Extension', targetMuscle: 'Quads', equipment: 'Machine', sets: 3, targetReps: '12-15', targetRpe: 9, restSeconds: 75 },
          { id: 're-8', exerciseId: 'ex-14', exerciseName: 'Hanging Leg Raises', targetMuscle: 'Core', equipment: 'Bodyweight', sets: 3, targetReps: '12-15', targetRpe: 8.5, restSeconds: 60 }
        ]
      },
      {
        id: 'd-3',
        dayName: 'Upper Body B - Hypertrophy',
        isRestDay: false,
        targetMuscles: ['Shoulders', 'Back', 'Arms'],
        estimatedMinutes: 60,
        exercises: [
          { id: 're-9', exerciseId: 'ex-6', exerciseName: 'Overhead Barbell Press', targetMuscle: 'Shoulders', equipment: 'Barbell', sets: 4, targetReps: '6-8', targetRpe: 8, restSeconds: 120 },
          { id: 're-10', exerciseId: 'ex-5', exerciseName: 'Seated Cable Row', targetMuscle: 'Back', equipment: 'Cable', sets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { id: 're-11', exerciseId: 'ex-7', exerciseName: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', equipment: 'Dumbbell', sets: 4, targetReps: '12-15', targetRpe: 9, restSeconds: 60 },
          { id: 're-12', exerciseId: 'ex-8', exerciseName: 'Incline Bicep Curl', targetMuscle: 'Arms', equipment: 'Dumbbell', sets: 3, targetReps: '10-12', targetRpe: 8.5, restSeconds: 60 }
        ]
      },
      {
        id: 'd-4',
        dayName: 'Lower Body B - Posterior Chain',
        isRestDay: false,
        targetMuscles: ['Hamstrings', 'Quads'],
        estimatedMinutes: 55,
        exercises: [
          { id: 're-13', exerciseId: 'ex-12', exerciseName: 'Romanian Deadlift', targetMuscle: 'Hamstrings', equipment: 'Barbell', sets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 120 },
          { id: 're-14', exerciseId: 'ex-13', exerciseName: 'Lying Leg Curl', targetMuscle: 'Hamstrings', equipment: 'Machine', sets: 4, targetReps: '10-12', targetRpe: 8.5, restSeconds: 75 },
          { id: 're-15', exerciseId: 'ex-10', exerciseName: 'Barbell Squat', targetMuscle: 'Quads', equipment: 'Barbell', sets: 3, targetReps: '8-10', targetRpe: 8, restSeconds: 120 }
        ]
      }
    ]
  },
  {
    id: 'plan-ppl',
    title: 'Push / Pull / Legs',
    description: '6-day high-frequency hypertrophy program optimizing muscle protein synthesis frequency.',
    level: 'Advanced',
    daysPerWeek: 6,
    durationWeeks: 12,
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01',
    days: [
      {
        id: 'd-ppl-1',
        dayName: 'Push A - Chest & Delts',
        isRestDay: false,
        targetMuscles: ['Chest', 'Shoulders', 'Arms'],
        estimatedMinutes: 60,
        exercises: [
          { id: 're-16', exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', targetMuscle: 'Chest', equipment: 'Barbell', sets: 4, targetReps: '6-8', targetRpe: 8, restSeconds: 120 },
          { id: 're-17', exerciseId: 'ex-2', exerciseName: 'Incline Bench Press', targetMuscle: 'Chest', equipment: 'Dumbbell', sets: 3, targetReps: '8-10', targetRpe: 8.5, restSeconds: 90 },
          { id: 're-18', exerciseId: 'ex-7', exerciseName: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', equipment: 'Dumbbell', sets: 4, targetReps: '12-15', targetRpe: 9, restSeconds: 60 },
          { id: 're-19', exerciseId: 'ex-9', exerciseName: 'Cable Tricep Pushdown', targetMuscle: 'Arms', equipment: 'Cable', sets: 3, targetReps: '10-12', targetRpe: 9, restSeconds: 60 }
        ]
      },
      {
        id: 'd-ppl-2',
        dayName: 'Pull A - Back & Biceps',
        isRestDay: false,
        targetMuscles: ['Back', 'Arms'],
        estimatedMinutes: 60,
        exercises: [
          { id: 're-20', exerciseId: 'ex-4', exerciseName: 'Lat Pulldown', targetMuscle: 'Back', equipment: 'Cable', sets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 90 },
          { id: 're-21', exerciseId: 'ex-5', exerciseName: 'Seated Cable Row', targetMuscle: 'Back', equipment: 'Cable', sets: 4, targetReps: '10-12', targetRpe: 8.5, restSeconds: 75 },
          { id: 're-22', exerciseId: 'ex-8', exerciseName: 'Incline Bicep Curl', targetMuscle: 'Arms', equipment: 'Dumbbell', sets: 4, targetReps: '10-12', targetRpe: 8.5, restSeconds: 60 }
        ]
      },
      {
        id: 'd-ppl-3',
        dayName: 'Legs A - Quads & Calves',
        isRestDay: false,
        targetMuscles: ['Quads', 'Core'],
        estimatedMinutes: 65,
        exercises: [
          { id: 're-23', exerciseId: 'ex-10', exerciseName: 'Barbell Squat', targetMuscle: 'Quads', equipment: 'Barbell', sets: 4, targetReps: '6-8', targetRpe: 8.5, restSeconds: 150 },
          { id: 're-24', exerciseId: 'ex-11', exerciseName: 'Leg Extension', targetMuscle: 'Quads', equipment: 'Machine', sets: 4, targetReps: '10-12', targetRpe: 9, restSeconds: 75 },
          { id: 're-25', exerciseId: 'ex-14', exerciseName: 'Hanging Leg Raises', targetMuscle: 'Core', equipment: 'Bodyweight', sets: 3, targetReps: '15', targetRpe: 8.5, restSeconds: 60 }
        ]
      }
    ]
  },
  {
    id: 'plan-fullbody',
    title: 'Full Body',
    description: '3-day full body split designed for maximum metabolic stimulus and athletic conditioning.',
    level: 'Beginner',
    daysPerWeek: 3,
    durationWeeks: 8,
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01',
    days: [
      {
        id: 'd-fb-1',
        dayName: 'Full Body Day 1',
        isRestDay: false,
        targetMuscles: ['Quads', 'Chest', 'Back'],
        estimatedMinutes: 50,
        exercises: [
          { id: 're-26', exerciseId: 'ex-10', exerciseName: 'Barbell Squat', targetMuscle: 'Quads', equipment: 'Barbell', sets: 3, targetReps: '8', targetRpe: 8, restSeconds: 120 },
          { id: 're-27', exerciseId: 'ex-1', exerciseName: 'Barbell Bench Press', targetMuscle: 'Chest', equipment: 'Barbell', sets: 3, targetReps: '8', targetRpe: 8, restSeconds: 120 },
          { id: 're-28', exerciseId: 'ex-4', exerciseName: 'Lat Pulldown', targetMuscle: 'Back', equipment: 'Cable', sets: 3, targetReps: '10', targetRpe: 8, restSeconds: 90 }
        ]
      },
      {
        id: 'd-fb-2',
        dayName: 'Full Body Day 2',
        isRestDay: false,
        targetMuscles: ['Hamstrings', 'Shoulders', 'Back'],
        estimatedMinutes: 50,
        exercises: [
          { id: 're-29', exerciseId: 'ex-12', exerciseName: 'Romanian Deadlift', targetMuscle: 'Hamstrings', equipment: 'Barbell', sets: 3, targetReps: '8', targetRpe: 8, restSeconds: 120 },
          { id: 're-30', exerciseId: 'ex-6', exerciseName: 'Overhead Barbell Press', targetMuscle: 'Shoulders', equipment: 'Barbell', sets: 3, targetReps: '8', targetRpe: 8, restSeconds: 90 },
          { id: 're-31', exerciseId: 'ex-5', exerciseName: 'Seated Cable Row', targetMuscle: 'Back', equipment: 'Cable', sets: 3, targetReps: '10', targetRpe: 8, restSeconds: 75 }
        ]
      },
      {
        id: 'd-fb-3',
        dayName: 'Full Body Day 3',
        isRestDay: false,
        targetMuscles: ['Chest', 'Quads', 'Hamstrings'],
        estimatedMinutes: 50,
        exercises: [
          { id: 're-32', exerciseId: 'ex-2', exerciseName: 'Incline Bench Press', targetMuscle: 'Chest', equipment: 'Dumbbell', sets: 3, targetReps: '10', targetRpe: 8.5, restSeconds: 90 },
          { id: 're-33', exerciseId: 'ex-11', exerciseName: 'Leg Extension', targetMuscle: 'Quads', equipment: 'Machine', sets: 3, targetReps: '12', targetRpe: 9, restSeconds: 60 },
          { id: 're-34', exerciseId: 'ex-13', exerciseName: 'Lying Leg Curl', targetMuscle: 'Hamstrings', equipment: 'Machine', sets: 3, targetReps: '12', targetRpe: 9, restSeconds: 60 }
        ]
      }
    ]
  },
  {
    id: 'plan-glutes',
    title: 'Glutes & Legs',
    description: '4-day targeted lower body specialization routine with posterior chain focus.',
    level: 'Intermediate',
    daysPerWeek: 4,
    durationWeeks: 10,
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01',
    days: [
      {
        id: 'd-gl-1',
        dayName: 'Glutes & Hamstrings Focus',
        isRestDay: false,
        targetMuscles: ['Hamstrings', 'Glutes'],
        estimatedMinutes: 55,
        exercises: [
          { id: 're-35', exerciseId: 'ex-12', exerciseName: 'Romanian Deadlift', targetMuscle: 'Hamstrings', equipment: 'Barbell', sets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 120 },
          { id: 're-36', exerciseId: 'ex-13', exerciseName: 'Lying Leg Curl', targetMuscle: 'Hamstrings', equipment: 'Machine', sets: 4, targetReps: '12-15', targetRpe: 9, restSeconds: 75 }
        ]
      },
      {
        id: 'd-gl-2',
        dayName: 'Quads & Calves Dominance',
        isRestDay: false,
        targetMuscles: ['Quads', 'Calves'],
        estimatedMinutes: 55,
        exercises: [
          { id: 're-37', exerciseId: 'ex-10', exerciseName: 'Barbell Squat', targetMuscle: 'Quads', equipment: 'Barbell', sets: 4, targetReps: '8-10', targetRpe: 8, restSeconds: 120 },
          { id: 're-38', exerciseId: 'ex-11', exerciseName: 'Leg Extension', targetMuscle: 'Quads', equipment: 'Machine', sets: 4, targetReps: '12-15', targetRpe: 9, restSeconds: 75 }
        ]
      }
    ]
  }
];

export const INITIAL_LOGS: WorkoutLog[] = [
  // Session 1 - Upper Body A (Week 1)
  {
    id: 'log-rawan-1',
    userId: 'user-rawan-1',
    planId: 'plan-1',
    dayId: 'd-1',
    dayName: 'Upper Body A - Strength Focus',
    date: '2026-08-18',
    durationSeconds: 3420,
    totalVolumeKg: 4280,
    completedExercises: [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 35, reps: 8, completed: true },
          { setNumber: 2, weightKg: 35, reps: 8, completed: true },
          { setNumber: 3, weightKg: 35, reps: 7, completed: true }
        ]
      },
      {
        exerciseId: 'ex-4',
        exerciseName: 'Lat Pulldown',
        targetMuscle: 'Back',
        sets: [
          { setNumber: 1, weightKg: 40, reps: 10, completed: true },
          { setNumber: 2, weightKg: 40, reps: 10, completed: true },
          { setNumber: 3, weightKg: 40, reps: 9, completed: true }
        ]
      },
      {
        exerciseId: 'ex-2',
        exerciseName: 'Incline Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 14, reps: 10, completed: true },
          { setNumber: 2, weightKg: 14, reps: 10, completed: true },
          { setNumber: 3, weightKg: 14, reps: 8, completed: true }
        ]
      }
    ],
    coachFeedback: 'Solid first session. Form on bench was crisp.'
  },
  // Session 2 - Lower Body A (Week 1)
  {
    id: 'log-rawan-2',
    userId: 'user-rawan-1',
    planId: 'plan-1',
    dayId: 'd-2',
    dayName: 'Lower Body A - Quad Focus',
    date: '2026-08-20',
    durationSeconds: 3600,
    totalVolumeKg: 5120,
    completedExercises: [
      {
        exerciseId: 'ex-10',
        exerciseName: 'Barbell Squat',
        targetMuscle: 'Quads',
        sets: [
          { setNumber: 1, weightKg: 45, reps: 8, completed: true },
          { setNumber: 2, weightKg: 45, reps: 8, completed: true },
          { setNumber: 3, weightKg: 45, reps: 8, completed: true }
        ]
      },
      {
        exerciseId: 'ex-12',
        exerciseName: 'Romanian Deadlift',
        targetMuscle: 'Hamstrings',
        sets: [
          { setNumber: 1, weightKg: 50, reps: 10, completed: true },
          { setNumber: 2, weightKg: 50, reps: 10, completed: true },
          { setNumber: 3, weightKg: 50, reps: 9, completed: true }
        ]
      }
    ]
  },
  // Session 3 - Upper Body A (Week 2 - Overload Step 1)
  {
    id: 'log-rawan-3',
    userId: 'user-rawan-1',
    planId: 'plan-1',
    dayId: 'd-1',
    dayName: 'Upper Body A - Strength Focus',
    date: '2026-08-26',
    durationSeconds: 3300,
    totalVolumeKg: 4680,
    completedExercises: [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 37.5, reps: 8, completed: true },
          { setNumber: 2, weightKg: 37.5, reps: 8, completed: true },
          { setNumber: 3, weightKg: 37.5, reps: 8, completed: true }
        ]
      },
      {
        exerciseId: 'ex-4',
        exerciseName: 'Lat Pulldown',
        targetMuscle: 'Back',
        sets: [
          { setNumber: 1, weightKg: 45, reps: 10, completed: true },
          { setNumber: 2, weightKg: 45, reps: 9, completed: true },
          { setNumber: 3, weightKg: 45, reps: 9, completed: true }
        ]
      },
      {
        exerciseId: 'ex-2',
        exerciseName: 'Incline Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 16, reps: 10, completed: true },
          { setNumber: 2, weightKg: 16, reps: 9, completed: true },
          { setNumber: 3, weightKg: 16, reps: 8, completed: true }
        ]
      }
    ]
  },
  // Session 4 - Lower Body A (Week 2 - Overload Step 1)
  {
    id: 'log-rawan-4',
    userId: 'user-rawan-1',
    planId: 'plan-1',
    dayId: 'd-2',
    dayName: 'Lower Body A - Quad Focus',
    date: '2026-08-28',
    durationSeconds: 3500,
    totalVolumeKg: 5800,
    completedExercises: [
      {
        exerciseId: 'ex-10',
        exerciseName: 'Barbell Squat',
        targetMuscle: 'Quads',
        sets: [
          { setNumber: 1, weightKg: 52.5, reps: 8, completed: true },
          { setNumber: 2, weightKg: 52.5, reps: 8, completed: true },
          { setNumber: 3, weightKg: 52.5, reps: 8, completed: true }
        ]
      },
      {
        exerciseId: 'ex-12',
        exerciseName: 'Romanian Deadlift',
        targetMuscle: 'Hamstrings',
        sets: [
          { setNumber: 1, weightKg: 60, reps: 10, completed: true },
          { setNumber: 2, weightKg: 60, reps: 10, completed: true },
          { setNumber: 3, weightKg: 60, reps: 8, completed: true }
        ]
      }
    ]
  },
  // Session 5 - Upper Body A (Week 3 - Overload Step 2)
  {
    id: 'log-rawan-5',
    userId: 'user-rawan-1',
    planId: 'plan-1',
    dayId: 'd-1',
    dayName: 'Upper Body A - Strength Focus',
    date: '2026-09-04',
    durationSeconds: 3480,
    totalVolumeKg: 5120,
    completedExercises: [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 40, reps: 8, completed: true },
          { setNumber: 2, weightKg: 40, reps: 8, completed: true },
          { setNumber: 3, weightKg: 40, reps: 7, completed: true }
        ]
      },
      {
        exerciseId: 'ex-4',
        exerciseName: 'Lat Pulldown',
        targetMuscle: 'Back',
        sets: [
          { setNumber: 1, weightKg: 50, reps: 10, completed: true },
          { setNumber: 2, weightKg: 50, reps: 9, completed: true },
          { setNumber: 3, weightKg: 50, reps: 8, completed: true }
        ]
      },
      {
        exerciseId: 'ex-2',
        exerciseName: 'Incline Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 18, reps: 8, completed: true },
          { setNumber: 2, weightKg: 18, reps: 8, completed: true },
          { setNumber: 3, weightKg: 18, reps: 7, completed: true }
        ]
      }
    ]
  },
  // Session 6 - Lower Body A (Week 4 - Current PRs!)
  {
    id: 'log-rawan-6',
    userId: 'user-rawan-1',
    planId: 'plan-1',
    dayId: 'd-2',
    dayName: 'Lower Body A - Quad Focus',
    date: '2026-09-12',
    durationSeconds: 3720,
    totalVolumeKg: 6900,
    completedExercises: [
      {
        exerciseId: 'ex-10',
        exerciseName: 'Barbell Squat',
        targetMuscle: 'Quads',
        sets: [
          { setNumber: 1, weightKg: 65, reps: 8, completed: true },
          { setNumber: 2, weightKg: 65, reps: 8, completed: true },
          { setNumber: 3, weightKg: 65, reps: 7, completed: true }
        ]
      },
      {
        exerciseId: 'ex-12',
        exerciseName: 'Romanian Deadlift',
        targetMuscle: 'Hamstrings',
        sets: [
          { setNumber: 1, weightKg: 75, reps: 8, completed: true },
          { setNumber: 2, weightKg: 75, reps: 8, completed: true },
          { setNumber: 3, weightKg: 75, reps: 7, completed: true }
        ]
      }
    ],
    coachFeedback: 'Huge PRs on squats and RDLs! Progressive overload working as planned.'
  },
  // Session 7 - Upper Body A (Week 4 - Current Peak PRs!)
  {
    id: 'log-rawan-7',
    userId: 'user-rawan-1',
    planId: 'plan-1',
    dayId: 'd-1',
    dayName: 'Upper Body A - Strength Focus',
    date: '2026-09-15',
    durationSeconds: 3600,
    totalVolumeKg: 5680,
    completedExercises: [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 42.5, reps: 8, completed: true },
          { setNumber: 2, weightKg: 42.5, reps: 8, completed: true },
          { setNumber: 3, weightKg: 42.5, reps: 8, completed: true }
        ]
      },
      {
        exerciseId: 'ex-4',
        exerciseName: 'Lat Pulldown',
        targetMuscle: 'Back',
        sets: [
          { setNumber: 1, weightKg: 55, reps: 8, completed: true },
          { setNumber: 2, weightKg: 55, reps: 8, completed: true },
          { setNumber: 3, weightKg: 55, reps: 8, completed: true }
        ]
      },
      {
        exerciseId: 'ex-2',
        exerciseName: 'Incline Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { setNumber: 1, weightKg: 20, reps: 8, completed: true },
          { setNumber: 2, weightKg: 20, reps: 8, completed: true },
          { setNumber: 3, weightKg: 20, reps: 7, completed: true }
        ]
      }
    ],
    coachFeedback: '20kg incline dumbbells locked in. Upper chest looking fuller.'
  }
];

export const INITIAL_CHECK_INS: WeeklyCheckIn[] = [
  {
    id: 'chk-1',
    userId: 'user-rawan-1',
    date: '2026-08-15',
    weightKg: 69.5,
    measurements: {
      waistCm: 78,
      chestCm: 92,
      armsCm: 28.5,
      hipsCm: 98,
      thighsCm: 56
    },
    photos: [
      {
        id: 'p-1',
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        angle: 'front',
        date: '2026-08-15'
      },
      {
        id: 'p-2',
        url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
        angle: 'side',
        date: '2026-08-15'
      },
      {
        id: 'p-3',
        url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
        angle: 'back',
        date: '2026-08-15'
      }
    ],
    energyRating: 4,
    sleepQuality: 4,
    hungerRating: 3,
    traineeNotes: 'Starting baseline check-in. Excited to start the program.',
    coachFeedback: 'Great starting baseline photos. Consistency on the step count and sleep is key this first phase.',
    reviewed: true,
    reviewedAt: '2026-08-16'
  },
  {
    id: 'chk-2',
    userId: 'user-rawan-1',
    date: '2026-08-29',
    weightKg: 67.8,
    measurements: {
      waistCm: 75.5,
      chestCm: 91,
      armsCm: 28,
      hipsCm: 96,
      thighsCm: 55
    },
    photos: [
      {
        id: 'p-4',
        url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
        angle: 'front',
        date: '2026-08-29'
      },
      {
        id: 'p-5',
        url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
        angle: 'side',
        date: '2026-08-29'
      },
      {
        id: 'p-6',
        url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
        angle: 'back',
        date: '2026-08-29'
      }
    ],
    energyRating: 4,
    sleepQuality: 3,
    hungerRating: 2,
    traineeNotes: 'Energy is high, hitting 10k steps every day. Hunger manageable.',
    coachFeedback: 'Down 1.7kg with visible waist reduction. Keep water above 3 liters.',
    reviewed: true,
    reviewedAt: '2026-08-30'
  },
  {
    id: 'chk-3',
    userId: 'user-rawan-1',
    date: '2026-09-12',
    weightKg: 66.2,
    measurements: {
      waistCm: 73,
      chestCm: 90,
      armsCm: 28,
      hipsCm: 94,
      thighsCm: 54
    },
    photos: [
      {
        id: 'p-7',
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        angle: 'front',
        date: '2026-09-12'
      },
      {
        id: 'p-8',
        url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
        angle: 'side',
        date: '2026-09-12'
      },
      {
        id: 'p-9',
        url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
        angle: 'back',
        date: '2026-09-12'
      }
    ],
    energyRating: 5,
    sleepQuality: 4,
    hungerRating: 3,
    traineeNotes: 'Strength maintained on all compound exercises. Clothes fit significantly looser around waist.',
    coachFeedback: undefined,
    reviewed: false
  }
];

export const INITIAL_DIET_PLANS: DietPlan[] = [
  {
    id: 'diet-1',
    title: 'Fat Loss & High Protein Shred',
    description: 'Caloric deficit protocol optimized for muscle preservation and satiety.',
    targetCalories: 1850,
    targetProteinG: 145,
    targetCarbsG: 180,
    targetFatsG: 45,
    waterTargetLiters: 3.2,
    assignedUserId: 'user-rawan-1',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01',
    meals: [
      {
        id: 'm-1',
        name: 'Meal 1 - Breakfast',
        time: '08:30 AM',
        items: [
          {
            id: 'i-1',
            name: 'Rolled Oats (Shofan)',
            quantity: '60g',
            calories: 220,
            proteinG: 8,
            carbsG: 40,
            fatsG: 4,
            swaps: ['50g Cream of Rice', '3 Whole Wheat Toast Slices']
          },
          {
            id: 'i-2',
            name: 'Boiled Eggs',
            quantity: '3 Eggs (1 whole + 2 whites)',
            calories: 130,
            proteinG: 16,
            carbsG: 1,
            fatsG: 5,
            swaps: ['100g Cottage Cheese (Gebna Areesh)', '1 Scoop Whey Protein']
          },
          {
            id: 'i-3',
            name: 'Black Coffee or Green Tea',
            quantity: '1 Cup',
            calories: 5,
            proteinG: 0,
            carbsG: 1,
            fatsG: 0
          }
        ]
      },
      {
        id: 'm-2',
        name: 'Meal 2 - Lunch',
        time: '02:00 PM',
        items: [
          {
            id: 'i-4',
            name: 'Grilled Chicken Breast (Sodoor Ferakh)',
            quantity: '180g cooked',
            calories: 290,
            proteinG: 55,
            carbsG: 0,
            fatsG: 6,
            swaps: ['200g White Fish / Tilapia', '180g Lean Beef (Low Fat)']
          },
          {
            id: 'i-5',
            name: 'Basmati Rice (Roz Basmati Maslooq)',
            quantity: '180g cooked',
            calories: 230,
            proteinG: 5,
            carbsG: 50,
            fatsG: 1,
            swaps: ['200g Boiled Potatoes', '180g Sweet Potatoes']
          },
          {
            id: 'i-6',
            name: 'Steamed Broccoli & Green Salad',
            quantity: '150g',
            calories: 50,
            proteinG: 3,
            carbsG: 8,
            fatsG: 1
          }
        ]
      },
      {
        id: 'm-3',
        name: 'Meal 3 - Pre-Workout Snack',
        time: '05:30 PM',
        items: [
          {
            id: 'i-7',
            name: 'Rice Cakes (Kak el Roz)',
            quantity: '2 Cakes',
            calories: 70,
            proteinG: 1.5,
            carbsG: 15,
            fatsG: 0.5
          },
          {
            id: 'i-8',
            name: 'Peanut Butter',
            quantity: '15g (1 Tablespoon)',
            calories: 95,
            proteinG: 4,
            carbsG: 3,
            fatsG: 8,
            swaps: ['15g Raw Almonds', '10g Dark Chocolate 85%']
          },
          {
            id: 'i-9',
            name: 'Banana',
            quantity: '1 Medium',
            calories: 105,
            proteinG: 1,
            carbsG: 27,
            fatsG: 0
          }
        ]
      },
      {
        id: 'm-4',
        name: 'Meal 4 - Dinner & Recovery',
        time: '09:00 PM',
        items: [
          {
            id: 'i-10',
            name: 'Cottage Cheese (Gebna Areesh)',
            quantity: '180g',
            calories: 175,
            proteinG: 25,
            carbsG: 6,
            fatsG: 3,
            swaps: ['150g Greek Yogurt 0%', '1 Can Light Tuna in Brine']
          },
          {
            id: 'i-11',
            name: 'Whole Grain Bread',
            quantity: '1 Slice',
            calories: 80,
            proteinG: 4,
            carbsG: 14,
            fatsG: 1
          },
          {
            id: 'i-12',
            name: 'Extra Virgin Olive Oil',
            quantity: '5ml (1 teaspoon)',
            calories: 45,
            proteinG: 0,
            carbsG: 0,
            fatsG: 5
          }
        ]
      }
    ]
  },
  {
    id: 'diet-2',
    title: 'Lean Muscle Hypertrophy Fuel',
    description: 'Controlled hypercaloric surplus with high carbohydrate density to power resistance training.',
    targetCalories: 2600,
    targetProteinG: 190,
    targetCarbsG: 310,
    targetFatsG: 65,
    waterTargetLiters: 4.0,
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01',
    meals: [
      {
        id: 'm-2-1',
        name: 'Meal 1 - Power Breakfast',
        time: '08:00 AM',
        items: [
          { id: 'i-2-1', name: 'Whole Eggs & Egg Whites', quantity: '4 Eggs (2 Whole + 2 Whites)', calories: 210, proteinG: 22, carbsG: 2, fatsG: 11 },
          { id: 'i-2-2', name: 'Oats with Honey & Banana', quantity: '80g Oats + 1 Banana', calories: 380, proteinG: 12, carbsG: 75, fatsG: 5 }
        ]
      },
      {
        id: 'm-2-2',
        name: 'Meal 2 - Post-Workout Anabolic Feed',
        time: '01:30 PM',
        items: [
          { id: 'i-2-3', name: 'Grilled Chicken Breast', quantity: '220g Raw Wt', calories: 260, proteinG: 50, carbsG: 0, fatsG: 4 },
          { id: 'i-2-4', name: 'Basmati White Rice', quantity: '250g Cooked', calories: 325, proteinG: 7, carbsG: 70, fatsG: 1 }
        ]
      }
    ]
  },
  {
    id: 'diet-3',
    title: 'Metabolic Recomp & Conditioning',
    description: 'Iso-caloric maintenance with elevated protein to accelerate body recomposition.',
    targetCalories: 2100,
    targetProteinG: 165,
    targetCarbsG: 220,
    targetFatsG: 55,
    waterTargetLiters: 3.5,
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01',
    meals: [
      {
        id: 'm-3-1',
        name: 'Meal 1 - Balanced Morning Fuel',
        time: '08:30 AM',
        items: [
          { id: 'i-3-1', name: 'Greek Yogurt 0% with Berries', quantity: '200g', calories: 150, proteinG: 20, carbsG: 14, fatsG: 0 },
          { id: 'i-3-2', name: 'Toast with Peanut Butter', quantity: '2 Slices + 15g PB', calories: 230, proteinG: 9, carbsG: 28, fatsG: 9 }
        ]
      },
      {
        id: 'm-3-2',
        name: 'Meal 2 - Midday Protein Bowl',
        time: '02:00 PM',
        items: [
          { id: 'i-3-3', name: 'Lean Minced Beef 95/5', quantity: '180g', calories: 250, proteinG: 38, carbsG: 0, fatsG: 9 },
          { id: 'i-3-4', name: 'Boiled Sweet Potatoes', quantity: '200g', calories: 180, proteinG: 3, carbsG: 42, fatsG: 0 }
        ]
      }
    ]
  }
];

export const INITIAL_FORM_CHECKS: FormCheckVideo[] = [
  {
    id: 'fc-1',
    userId: 'user-omar-2',
    exerciseName: 'Barbell Squat',
    targetMuscle: 'Quads',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    recordedAt: '2026-09-21 17:30',
    setDetails: 'Set 3 • 140 kg × 5 reps',
    notes: 'Knees felt a bit unstable coming out of the hole on rep 4. Depth okay?',
    status: 'pending'
  },
  {
    id: 'fc-2',
    userId: 'user-omar-2',
    exerciseName: 'Barbell Bench Press',
    targetMuscle: 'Chest',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    recordedAt: '2026-09-18 19:15',
    setDetails: 'Set 4 • 105 kg × 6 reps',
    notes: 'Testing pause on chest for 1 second. Bar path felt clean.',
    coachFeedback: 'Solid pause control! Keep elbows tucked slightly more to protect shoulder capsule.',
    status: 'reviewed',
    reviewedAt: '2026-09-18 20:30'
  },
  {
    id: 'fc-3',
    userId: 'user-rawan-1',
    exerciseName: 'Romanian Deadlift',
    targetMuscle: 'Hamstrings',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    recordedAt: '2026-09-20 18:45',
    setDetails: 'Set 3 • 75 kg × 8 reps',
    notes: 'Focusing on deep hamstring stretch, does my bar stay close enough to shins?',
    status: 'pending'
  }
];

export const INITIAL_COACH_SETTINGS: CoachSettings = {
  coachName: 'Captain Yassen Ahmed',
  brandName: 'IRON FORGE ELITE',
  tagline: 'Championship Bodybuilding & High-Performance Transformations',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  whatsappNumber: '+201023456789',
  email: 'yassen.ahmed@fitness.io',
  currency: 'EGP',
  renewalReminderDaysBefore: 3,
  checkInDays: ['Friday', 'Sunday'],
  packages: [
    {
      id: 'pkg-vip-1m',
      name: 'Full VIP Coaching',
      durationMonths: 1,
      price: 2500,
      description: 'Custom training split, hyper-personalized nutrition, weekly check-in audits & 24/7 WhatsApp access.',
      isPopular: false
    },
    {
      id: 'pkg-vip-3m',
      name: 'Full VIP Coaching',
      durationMonths: 3,
      price: 6000,
      description: '12-week complete transformation protocol with periodized hypertrophy phases & bi-weekly diet adjustments.',
      isPopular: true
    },
    {
      id: 'pkg-vip-6m',
      name: 'Full VIP Coaching',
      durationMonths: 6,
      price: 10500,
      description: 'Long-term elite physical overhaul with advanced fatigue management & priority direct coach support.',
      isPopular: false
    },
    {
      id: 'pkg-workout-3m',
      name: 'Workout Only',
      durationMonths: 3,
      price: 3600,
      description: 'Structured resistance programming with exercise video cues, volume progression & exercise substitution guides.',
      isPopular: false
    },
    {
      id: 'pkg-diet-3m',
      name: 'Nutrition Only',
      durationMonths: 3,
      price: 3000,
      description: 'Custom macro allocations, structured meal blueprints, grocery shopping guide & supplement stack recommendations.',
      isPopular: false
    },
    {
      id: 'pkg-contest-prep',
      name: 'Contest Prep',
      durationMonths: 6,
      price: 14000,
      description: 'Championship prep for NPC / IFBB athletes: peak week depletion & load, daily posing reviews & sodium manipulation.',
      isPopular: false
    }
  ]
};


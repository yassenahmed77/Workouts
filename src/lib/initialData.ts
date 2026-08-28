import { Exercise, User, WorkoutPlan, WorkoutLog } from '@/types';

export const INITIAL_EXERCISES: Exercise[] = [
  // Chest
  {
    id: 'ex-bench-press',
    name: 'Barbell Flat Bench Press',
    targetMuscle: 'Chest',
    equipment: 'Barbell',
    category: 'Compound',
    executionCue: 'Retract scapulae, maintain arched thoracic spine, touch mid-sternum, press upward.',
    tips: ['Keep wrists stacked above elbows', 'Drive feet firmly into the floor']
  },
  {
    id: 'ex-incline-db-press',
    name: 'Incline Dumbbell Press (30°)',
    targetMuscle: 'Chest',
    equipment: 'Dumbbell',
    category: 'Compound',
    executionCue: 'Set bench to 30 degrees. Flare elbows at 45 degrees, lower smoothly, press without clanking.',
    tips: ['Focus on clavicular pec contraction at top', 'Control 3s eccentric phase']
  },
  {
    id: 'ex-cable-chest-flye',
    name: 'High-to-Low Cable Flye',
    targetMuscle: 'Chest',
    equipment: 'Cable',
    category: 'Isolation',
    executionCue: 'Slight bend in elbows. Cross hands at contraction point below lower chest.',
    tips: ['Squeeze lower pecs at peak contraction', 'Do not rotate shoulders forward']
  },
  {
    id: 'ex-dips',
    name: 'Weighted Parallel Bar Dips',
    targetMuscle: 'Chest',
    equipment: 'Bodyweight',
    category: 'Compound',
    executionCue: 'Lean torso forward 30 degrees to emphasize lower chest fibers. Descend until shoulders match elbow height.',
    tips: ['Tuck chin slightly', 'Avoid excessive shoulder hyperextension']
  },

  // Back
  {
    id: 'ex-barbell-row',
    name: 'Bent-Over Barbell Row',
    targetMuscle: 'Back',
    equipment: 'Barbell',
    category: 'Compound',
    executionCue: 'Hinge at hips to 45 degrees. Pull bar toward lower ribcage, leading with elbows.',
    tips: ['Keep core braced', 'Do not use momentum to swing weight']
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Neutral Grip Lat Pulldown',
    targetMuscle: 'Back',
    equipment: 'Cable',
    category: 'Compound',
    executionCue: 'Depress shoulders prior to pull. Draw elbows down toward hip pockets.',
    tips: ['Maintain proud chest', 'Full stretch at the top without shrugging']
  },
  {
    id: 'ex-chest-supported-row',
    name: 'Chest-Supported Incline Row',
    targetMuscle: 'Back',
    equipment: 'Dumbbell',
    category: 'Compound',
    executionCue: 'Lie chest-down on incline bench. Pull dumbbells upward while retracting rhomboids.',
    tips: ['Zero spinal loading allows pure back overload', 'Hold peak squeeze for 1 second']
  },
  {
    id: 'ex-face-pull',
    name: 'Rope Face Pull with External Rotation',
    targetMuscle: 'Back',
    equipment: 'Cable',
    category: 'Isolation',
    executionCue: 'Pull rope toward eye level while rotating thumbs backward.',
    tips: ['Strengthens rear delts and rotator cuffs', 'Use controlled tempo']
  },

  // Shoulders
  {
    id: 'ex-overhead-press',
    name: 'Standing Overhead Barbell Press',
    targetMuscle: 'Shoulders',
    equipment: 'Barbell',
    category: 'Compound',
    executionCue: 'Lock glutes and core. Press bar in vertical path, clearing head by tucking chin slightly.',
    tips: ['Avoid excessive lumbar arching', 'Full lockout overhead']
  },
  {
    id: 'ex-db-lateral-raise',
    name: 'Strict Dumbbell Lateral Raise',
    targetMuscle: 'Shoulders',
    equipment: 'Dumbbell',
    category: 'Isolation',
    executionCue: 'Slight forward lean. Lead with elbows, raise to parallel with shoulders in scapular plane.',
    tips: ['Pour water motion cue', 'Avoid swinging from hips']
  },
  {
    id: 'ex-cable-lateral-raise',
    name: 'Single Arm Cable Lateral Raise (Behind Body)',
    targetMuscle: 'Shoulders',
    equipment: 'Cable',
    category: 'Isolation',
    executionCue: 'Set pulley to wrist height. Maintain tension throughout the entire range of motion.',
    tips: ['Consistent resistance profile compared to dumbbells']
  },

  // Quads & Glutes
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    targetMuscle: 'Quads',
    equipment: 'Barbell',
    category: 'Compound',
    executionCue: 'Deep breath into abdomen, push knees outward over toes, hit parallel or below, drive up.',
    tips: ['Maintain neutral spine throughout', 'Weight distributed across midfoot']
  },
  {
    id: 'ex-leg-press',
    name: '45° Leg Press',
    targetMuscle: 'Quads',
    equipment: 'Machine',
    category: 'Compound',
    executionCue: 'Place feet shoulder-width mid-platform. Lower sled with full control without rounding pelvis.',
    tips: ['Do not lock knees forcefully at apex', 'Drive through whole foot']
  },
  {
    id: 'ex-walking-lunges',
    name: 'Dumbbell Walking Lunges',
    targetMuscle: 'Quads',
    equipment: 'Dumbbell',
    category: 'Compound',
    executionCue: 'Step forward, descend until rear knee hovers 2cm off floor, drive through front heel.',
    tips: ['Keep torso upright for quad bias', 'Controlled cadence']
  },
  {
    id: 'ex-leg-extension',
    name: 'Seated Leg Extension',
    targetMuscle: 'Quads',
    equipment: 'Machine',
    category: 'Isolation',
    executionCue: 'Align machine axis with knee joint. Extend knees fully and hold top squeeze for 1 second.',
    tips: ['Avoid slamming weights at bottom', 'Excellent quad finisher']
  },

  // Hamstrings & Posterior Chain
  {
    id: 'ex-rdl',
    name: 'Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings',
    equipment: 'Barbell',
    category: 'Compound',
    executionCue: 'Soft knees, push hips backward as if touching a wall behind you until hamstring stretch is reached.',
    tips: ['Bar stays in contact with legs', 'Do not round lower back']
  },
  {
    id: 'ex-seated-leg-curl',
    name: 'Seated Hamstring Leg Curl',
    targetMuscle: 'Hamstrings',
    equipment: 'Machine',
    category: 'Isolation',
    executionCue: 'Anchor thigh pad securely. Pull heels under seat forcefully, control return for 3 seconds.',
    tips: ['Train hamstrings in lengthened hip flexion']
  },

  // Arms
  {
    id: 'ex-incline-db-curl',
    name: 'Incline Dumbbell Bicep Curl',
    targetMuscle: 'Arms',
    equipment: 'Dumbbell',
    category: 'Isolation',
    executionCue: 'Set bench to 45°. Let arms hang back for maximum stretch of bicep long head.',
    tips: ['Supinate wrists at top of movement', 'Keep upper arms motionless']
  },
  {
    id: 'ex-tricep-pushdown',
    name: 'Triceps Cable Rope Pushdown',
    targetMuscle: 'Arms',
    equipment: 'Cable',
    category: 'Isolation',
    executionCue: 'Pin elbows to sides. Flare rope outward at full extension and squeeze lateral tricep head.',
    tips: ['Full lockout on every repetition', 'Controlled return']
  },
  {
    id: 'ex-skullcrushers',
    name: 'EZ-Bar Skullcrushers',
    targetMuscle: 'Arms',
    equipment: 'Barbell',
    category: 'Isolation',
    executionCue: 'Lower bar to hairline or slightly behind bench for enhanced long head stretch.',
    tips: ['Elbows should point upward throughout']
  },

  // Core
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg / Knee Raise',
    targetMuscle: 'Core',
    equipment: 'Bodyweight',
    category: 'Isolation',
    executionCue: 'Hang from bar. Roll pelvis upward rather than just swinging legs.',
    tips: ['Avoid swinging using shoulder momentum', 'Contract abs deliberately']
  },
  {
    id: 'ex-cable-woodchopper',
    name: 'Cable High-to-Low Woodchopper',
    targetMuscle: 'Core',
    equipment: 'Cable',
    category: 'Isolation',
    executionCue: 'Rotate through thoracic spine and hips, bracing obliques through full arc.',
    tips: ['Keep arms extended with soft elbows']
  }
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
    notes: 'Head Strength & Conditioning Coach.'
  }
];

export const INITIAL_PLANS: WorkoutPlan[] = [
  {
    id: 'plan-hypertrophy-4day',
    title: '4-Day Upper / Lower Hypertrophy Split',
    description: 'Periodized high-volume hypertrophy protocol targeting myofibrillar growth with strict rest intervals.',
    level: 'Intermediate',
    durationWeeks: 8,
    daysPerWeek: 4,
    createdAt: '2024-04-10',
    updatedAt: '2024-07-15',
    days: [
      {
        id: 'day-u1',
        dayName: 'Day 1: Upper Body Heavy',
        isRestDay: false,
        targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
        estimatedMinutes: 65,
        exercises: [
          {
            id: 're-1',
            exerciseId: 'ex-bench-press',
            exerciseName: 'Barbell Flat Bench Press',
            targetMuscle: 'Chest',
            equipment: 'Barbell',
            sets: 4,
            targetReps: '6-8',
            targetRpe: 8,
            restSeconds: 120,
            notes: 'Heavy compound focus. RPE 8.'
          },
          {
            id: 're-2',
            exerciseId: 'ex-barbell-row',
            exerciseName: 'Bent-Over Barbell Row',
            targetMuscle: 'Back',
            equipment: 'Barbell',
            sets: 4,
            targetReps: '8',
            targetRpe: 8,
            restSeconds: 90,
            notes: 'Match bench intensity. Torso fixed at 45 degrees.'
          },
          {
            id: 're-3',
            exerciseId: 'ex-incline-db-press',
            exerciseName: 'Incline Dumbbell Press (30°)',
            targetMuscle: 'Chest',
            equipment: 'Dumbbell',
            sets: 3,
            targetReps: '10-12',
            targetRpe: 8.5,
            restSeconds: 75,
            notes: '3-second negative descent on every rep.'
          },
          {
            id: 're-4',
            exerciseId: 'ex-lat-pulldown',
            exerciseName: 'Neutral Grip Lat Pulldown',
            targetMuscle: 'Back',
            equipment: 'Cable',
            sets: 3,
            targetReps: '10-12',
            targetRpe: 9,
            restSeconds: 75,
            notes: 'Squeeze lats down hard at the bottom.'
          }
        ]
      },
      {
        id: 'day-l1',
        dayName: 'Day 2: Lower Body Quads & Calves',
        isRestDay: false,
        targetMuscles: ['Quads', 'Hamstrings', 'Core'],
        estimatedMinutes: 60,
        exercises: [
          {
            id: 're-7',
            exerciseId: 'ex-barbell-squat',
            exerciseName: 'Barbell Back Squat',
            targetMuscle: 'Quads',
            equipment: 'Barbell',
            sets: 4,
            targetReps: '6-8',
            targetRpe: 8,
            restSeconds: 150,
            notes: 'Solid depth below parallel.'
          },
          {
            id: 're-8',
            exerciseId: 'ex-leg-press',
            exerciseName: '45° Leg Press',
            targetMuscle: 'Quads',
            equipment: 'Machine',
            sets: 3,
            targetReps: '10-12',
            targetRpe: 8.5,
            restSeconds: 90,
            notes: 'Slow controlled descent. Feet mid-plate.'
          }
        ]
      },
      {
        id: 'day-rest-1',
        dayName: 'Day 3: Active Recovery / Rest',
        isRestDay: true,
        targetMuscles: [],
        estimatedMinutes: 0,
        exercises: []
      },
      {
        id: 'day-u2',
        dayName: 'Day 4: Upper Body Density & Delts',
        isRestDay: false,
        targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
        estimatedMinutes: 65,
        exercises: [
          {
            id: 're-11',
            exerciseId: 'ex-overhead-press',
            exerciseName: 'Standing Overhead Barbell Press',
            targetMuscle: 'Shoulders',
            equipment: 'Barbell',
            sets: 4,
            targetReps: '6-8',
            targetRpe: 8,
            restSeconds: 120,
            notes: 'Brace core tight, do not lean back.'
          },
          {
            id: 're-12',
            exerciseId: 'ex-chest-supported-row',
            exerciseName: 'Chest-Supported Incline Row',
            targetMuscle: 'Back',
            equipment: 'Dumbbell',
            sets: 4,
            targetReps: '10',
            targetRpe: 8.5,
            restSeconds: 90,
            notes: 'Squeeze upper back without shrugging.'
          }
        ]
      }
    ]
  },
  {
    id: 'plan-push-pull-legs',
    title: '3-Day Push / Pull / Legs Protocol',
    description: 'Foundational strength and hypertrophy progression targeting compound movements.',
    level: 'Intermediate',
    durationWeeks: 10,
    daysPerWeek: 3,
    createdAt: '2024-05-02',
    updatedAt: '2024-07-28',
    days: [
      {
        id: 'day-ppl-push',
        dayName: 'Day 1: Push (Chest, Shoulders, Triceps)',
        isRestDay: false,
        targetMuscles: ['Chest', 'Shoulders', 'Arms'],
        estimatedMinutes: 60,
        exercises: [
          {
            id: 're-20',
            exerciseId: 'ex-bench-press',
            exerciseName: 'Barbell Flat Bench Press',
            targetMuscle: 'Chest',
            equipment: 'Barbell',
            sets: 4,
            targetReps: '6-8',
            targetRpe: 8,
            restSeconds: 120,
            notes: 'Maintain tight scapular retraction.'
          },
          {
            id: 're-21',
            exerciseId: 'ex-overhead-press',
            exerciseName: 'Standing Overhead Barbell Press',
            targetMuscle: 'Shoulders',
            equipment: 'Barbell',
            sets: 3,
            targetReps: '8',
            targetRpe: 8,
            restSeconds: 90,
            notes: 'Full lockout overhead.'
          }
        ]
      },
      {
        id: 'day-ppl-pull',
        dayName: 'Day 2: Pull (Back, Biceps)',
        isRestDay: false,
        targetMuscles: ['Back', 'Arms'],
        estimatedMinutes: 60,
        exercises: [
          {
            id: 're-24',
            exerciseId: 'ex-barbell-row',
            exerciseName: 'Bent-Over Barbell Row',
            targetMuscle: 'Back',
            equipment: 'Barbell',
            sets: 4,
            targetReps: '8',
            targetRpe: 8,
            restSeconds: 90,
            notes: 'Hinge at hips, pull to sternum.'
          }
        ]
      },
      {
        id: 'day-ppl-legs',
        dayName: 'Day 3: Legs & Core',
        isRestDay: false,
        targetMuscles: ['Quads', 'Hamstrings', 'Core'],
        estimatedMinutes: 60,
        exercises: [
          {
            id: 're-28',
            exerciseId: 'ex-barbell-squat',
            exerciseName: 'Barbell Back Squat',
            targetMuscle: 'Quads',
            equipment: 'Barbell',
            sets: 4,
            targetReps: '6-8',
            targetRpe: 8,
            restSeconds: 120,
            notes: 'Hit parallel with chest proud.'
          }
        ]
      }
    ]
  }
];

export const INITIAL_LOGS: WorkoutLog[] = [];

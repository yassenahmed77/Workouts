'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, WorkoutPlan, Exercise, WorkoutLog, WeeklyCheckIn, DietPlan, FormCheckVideo, CoachSettings, ClientSubscription } from '@/types';
import { INITIAL_USERS, INITIAL_PLANS, INITIAL_EXERCISES, INITIAL_LOGS, INITIAL_CHECK_INS, INITIAL_DIET_PLANS, INITIAL_FORM_CHECKS, INITIAL_COACH_SETTINGS } from '@/lib/initialData';
import { 
  supabase, 
  isSupabaseConfigured, 
  mapDbUserToUser, 
  mapUserToDb, 
  mapDbPlanToPlan, 
  mapPlanToDb, 
  mapDbExerciseToExercise, 
  mapExerciseToDb, 
  mapDbLogToLog, 
  mapLogToDb 
} from '@/lib/supabase';

interface GymContextType {
  currentUser: User | null;
  users: User[];
  plans: WorkoutPlan[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  isLoaded: boolean;
  isSupabaseActive: boolean;
  login: (userId: string) => void;
  loginWithEmail: (email: string) => User | null;
  logout: () => void;
  switchUser: (userId: string) => void;
  assignPlanToUser: (userId: string, planId: string) => Promise<void>;
  createPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkoutPlan>;
  updatePlan: (plan: WorkoutPlan) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  saveWorkoutLog: (log: WorkoutLog) => Promise<void>;
  deleteWorkoutLog: (logId: string) => Promise<void>;
  createTrainee: (name: string, email: string, goal: User['goal'], weightKg: number, heightCm: number, extraFields?: Partial<User>) => Promise<User>;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  updateUserNotes: (userId: string, notes: string) => Promise<void>;
  updateUserSubscription: (userId: string, subscription: ClientSubscription) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
  updateExercise: (exercise: Exercise) => Promise<void>;
  deleteExercise: (exerciseId: string) => Promise<void>;
  getPlanForUser: (userId: string) => WorkoutPlan | undefined;
  getUserLogs: (userId: string) => WorkoutLog[];
  checkIns: WeeklyCheckIn[];
  dietPlans: DietPlan[];
  getCheckInsForUser: (userId: string) => WeeklyCheckIn[];
  saveCheckInFeedback: (checkInId: string, feedback: string) => Promise<void>;
  addCheckIn: (checkIn: Omit<WeeklyCheckIn, 'id'>) => Promise<WeeklyCheckIn>;
  getDietPlanForUser: (userId: string) => DietPlan | undefined;
  assignDietPlanToUser: (userId: string, dietPlanId: string) => Promise<void>;
  createDietPlan: (plan: Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DietPlan>;
  updateDietPlan: (plan: DietPlan) => Promise<void>;
  deleteDietPlan: (planId: string) => Promise<void>;
  formCheckVideos: FormCheckVideo[];
  getFormCheckVideosForUser: (userId: string) => FormCheckVideo[];
  addFormCheckVideo: (video: Omit<FormCheckVideo, 'id' | 'recordedAt'>) => Promise<FormCheckVideo>;
  updateFormCheckVideo: (videoId: string, updates: Partial<FormCheckVideo>) => Promise<void>;
  deleteFormCheckVideo: (videoId: string) => Promise<void>;
  coachSettings: CoachSettings;
  updateCoachSettings: (settings: Partial<CoachSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const STORAGE_KEY_USERS = 'pro_gym_users_v11';
const STORAGE_KEY_PLANS = 'pro_gym_plans_v9';
const STORAGE_KEY_EXERCISES = 'pro_gym_exercises_v9';
const STORAGE_KEY_LOGS = 'pro_gym_logs_v9';
const STORAGE_KEY_CURRENT_USER_ID = 'pro_gym_active_user_id_v9';
const STORAGE_KEY_CHECKINS = 'pro_gym_checkins_v10';
const STORAGE_KEY_DIET_PLANS = 'pro_gym_diet_plans_v10';
const STORAGE_KEY_FORM_CHECKS = 'pro_gym_form_checks_v1';
const STORAGE_KEY_COACH_SETTINGS = 'pro_gym_coach_settings_v1';

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [plans, setPlans] = useState<WorkoutPlan[]>(INITIAL_PLANS);
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [logs, setLogs] = useState<WorkoutLog[]>(INITIAL_LOGS);
  const [checkIns, setCheckIns] = useState<WeeklyCheckIn[]>(INITIAL_CHECK_INS);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(INITIAL_DIET_PLANS);
  const [formCheckVideos, setFormCheckVideos] = useState<FormCheckVideo[]>(INITIAL_FORM_CHECKS);
  const [coachSettings, setCoachSettings] = useState<CoachSettings>(INITIAL_COACH_SETTINGS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);

  const refreshData = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const [usersRes, plansRes, exercisesRes, logsRes] = await Promise.all([
          supabase.from('users').select('*').order('created_at', { ascending: true }),
          supabase.from('plans').select('*').order('created_at', { ascending: false }),
          supabase.from('exercises').select('*').order('name', { ascending: true }),
          supabase.from('workout_logs').select('*').order('created_at', { ascending: false })
        ]);

        if (usersRes.data && usersRes.data.length > 0) {
          const storedUsersRaw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_USERS) : null;
          const cachedUsersMap = new Map<string, User>();
          if (storedUsersRaw) {
            try {
              const cached = JSON.parse(storedUsersRaw) as User[];
              cached.forEach((u) => cachedUsersMap.set(u.id, u));
            } catch (e) {}
          }

          const dbUsers = usersRes.data.map((row) => {
            const user = mapDbUserToUser(row);
            const cached = cachedUsersMap.get(user.id);
            const seed = INITIAL_USERS.find((s) => s.id === user.id);
            return {
              ...seed,
              ...user,
              subscription: cached?.subscription || seed?.subscription,
              avatarUrl: user.avatarUrl || cached?.avatarUrl || seed?.avatarUrl,
            };
          });
          const dbIds = new Set(dbUsers.map((u) => u.id));
          const missingSeed = INITIAL_USERS.filter((u) => !dbIds.has(u.id)).map((u) => {
            const cached = cachedUsersMap.get(u.id);
            return cached ? { ...u, ...cached } : u;
          });
          setUsers([...dbUsers, ...missingSeed]);
        }
        if (plansRes.data) {
          setPlans(plansRes.data.map(mapDbPlanToPlan));
        }
        if (exercisesRes.data && exercisesRes.data.length > 0) {
          setExercises(exercisesRes.data.map(mapDbExerciseToExercise));
        }
        if (logsRes.data) {
          setLogs(logsRes.data.map(mapDbLogToLog));
        }

        setIsSupabaseActive(true);
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to cached local storage:', err);
        setIsSupabaseActive(false);
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      // Safe JSON parsing helper to ensure corrupted items do not crash initialization
      const safeParseJSON = <T,>(raw: string | null, fallback: T): T => {
        if (!raw) return fallback;
        try {
          return JSON.parse(raw) as T;
        } catch (e) {
          console.warn('LocalStorage item parse error, falling back:', e);
          return fallback;
        }
      };

      try {
        const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
        const storedPlans = localStorage.getItem(STORAGE_KEY_PLANS);
        const storedExercises = localStorage.getItem(STORAGE_KEY_EXERCISES);
        const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
        const storedActiveId = localStorage.getItem(STORAGE_KEY_CURRENT_USER_ID);
        const storedCheckIns = localStorage.getItem(STORAGE_KEY_CHECKINS);
        const storedDietPlans = localStorage.getItem(STORAGE_KEY_DIET_PLANS);
        const storedFormChecks = localStorage.getItem(STORAGE_KEY_FORM_CHECKS);
        const storedCoachSettings = localStorage.getItem(STORAGE_KEY_COACH_SETTINGS);

        if (storedUsers !== null) {
          const parsed = safeParseJSON<User[]>(storedUsers, INITIAL_USERS);
          const existingIds = new Set(parsed.map((u) => u.id));
          const missingInitial = INITIAL_USERS.filter((u) => !existingIds.has(u.id));
          const merged = parsed.map((u) => {
            const seed = INITIAL_USERS.find((s) => s.id === u.id);
            if (seed) {
              return { ...seed, ...u, avatarUrl: u.avatarUrl || seed.avatarUrl };
            }
            return u;
          });
          setUsers([...merged, ...missingInitial]);
        } else {
          setUsers(INITIAL_USERS);
        }

        if (storedPlans !== null) {
          const parsed = safeParseJSON<WorkoutPlan[]>(storedPlans, INITIAL_PLANS);
          const existingIds = new Set(parsed.map((p) => p.id));
          const missingPlans = INITIAL_PLANS.filter((p) => !existingIds.has(p.id));
          setPlans([...parsed, ...missingPlans]);
        } else {
          setPlans(INITIAL_PLANS);
        }

        if (storedLogs !== null) {
          const parsedLogs = safeParseJSON<WorkoutLog[]>(storedLogs, INITIAL_LOGS);
          if (parsedLogs.length === 0) {
            setLogs(INITIAL_LOGS);
          } else {
            const existingLogIds = new Set(parsedLogs.map((l) => l.id));
            const missingLogs = INITIAL_LOGS.filter((l) => !existingLogIds.has(l.id));
            setLogs([...parsedLogs, ...missingLogs]);
          }
        } else {
          setLogs(INITIAL_LOGS);
        }

        if (storedCheckIns !== null) {
          const parsedCheckIns = safeParseJSON<WeeklyCheckIn[]>(storedCheckIns, INITIAL_CHECK_INS);
          if (parsedCheckIns.length === 0) {
            setCheckIns(INITIAL_CHECK_INS);
          } else {
            const existingIds = new Set(parsedCheckIns.map((c) => c.id));
            const missingCheckIns = INITIAL_CHECK_INS.filter((c) => !existingIds.has(c.id));
            setCheckIns([...parsedCheckIns, ...missingCheckIns]);
          }
        } else {
          setCheckIns(INITIAL_CHECK_INS);
        }

        if (storedDietPlans !== null) {
          const parsed = safeParseJSON<DietPlan[]>(storedDietPlans, INITIAL_DIET_PLANS);
          const existingIds = new Set(parsed.map((d) => d.id));
          const missingDiet = INITIAL_DIET_PLANS.filter((d) => !existingIds.has(d.id));
          setDietPlans([...parsed, ...missingDiet]);
        } else {
          setDietPlans(INITIAL_DIET_PLANS);
        }

        if (storedFormChecks !== null) {
          const parsed = safeParseJSON<FormCheckVideo[]>(storedFormChecks, INITIAL_FORM_CHECKS);
          const existingIds = new Set(parsed.map((f) => f.id));
          const missingChecks = INITIAL_FORM_CHECKS.filter((f) => !existingIds.has(f.id));
          setFormCheckVideos([...parsed, ...missingChecks]);
        } else {
          setFormCheckVideos(INITIAL_FORM_CHECKS);
        }

        if (storedCoachSettings !== null) {
          const parsed = safeParseJSON<CoachSettings>(storedCoachSettings, INITIAL_COACH_SETTINGS);
          setCoachSettings({ ...INITIAL_COACH_SETTINGS, ...parsed });
        } else {
          setCoachSettings(INITIAL_COACH_SETTINGS);
        }

        if (storedActiveId) setCurrentUserId(storedActiveId);
        else setCurrentUserId('user-rawan-1');

        await refreshData();

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const directUserParam = params.get('user') || params.get('athlete') || params.get('trainee');
          if (directUserParam) {
            setCurrentUserId(directUserParam);
            localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, directUserParam);
          }
        }
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setIsLoaded(true);
      }
    };

    init();
  }, [refreshData]);

  useEffect(() => {
    if (!isLoaded) return;
    // Guard against data wipeout: never overwrite storage with empty arrays if initial state exists
    if (users.length === 0 && INITIAL_USERS.length > 0) return;
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
      localStorage.setItem(STORAGE_KEY_FORM_CHECKS, JSON.stringify(formCheckVideos));
      localStorage.setItem(STORAGE_KEY_COACH_SETTINGS, JSON.stringify(coachSettings));
      if (currentUserId) localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, currentUserId);
      else localStorage.removeItem(STORAGE_KEY_CURRENT_USER_ID);
    } catch (e) {
      console.warn('LocalStorage sync warning:', e);
    }
  }, [users, plans, exercises, logs, formCheckVideos, coachSettings, currentUserId, isLoaded]);

  const currentUser = useMemo(() => {
    return currentUserId ? users.find((u) => u.id === currentUserId) || null : null;
  }, [currentUserId, users]);

  const login = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, userId);
  };

  const loginWithEmail = (email: string): User | null => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found) {
      login(found.id);
      return found;
    }
    return null;
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER_ID);
    if (typeof window !== 'undefined' && window.history.pushState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('user');
      url.searchParams.delete('athlete');
      url.searchParams.delete('trainee');
      window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  const switchUser = (userId: string) => {
    login(userId);
  };

  const assignPlanToUser = async (userId: string, planId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, assignedPlanId: planId } : u))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('users')
          .update({ assigned_plan_id: planId })
          .eq('id', userId);
      } catch (err) {
        console.error('Supabase assign plan error:', err);
      }
    }
  };

  const createPlan = async (planData: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan> => {
    const now = new Date().toISOString();
    const newPlan: WorkoutPlan = {
      coachId: (planData as any).coachId ?? (currentUser?.role === 'coach' ? currentUser.id : undefined),
      ...planData,
      id: `plan-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    setPlans((prev) => [newPlan, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = mapPlanToDb(newPlan);
        const { error } = await supabase.from('plans').upsert([payload]);
        if (error) {
          console.error('Supabase create plan error:', error.message, error);
        }
      } catch (err) {
        console.error('Supabase create plan catch error:', err);
      }
    }

    return newPlan;
  };

  const updatePlan = async (updatedPlan: WorkoutPlan) => {
    const withTimestamp = {
      ...updatedPlan,
      updatedAt: new Date().toISOString()
    };

    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? withTimestamp : p)));

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = mapPlanToDb(withTimestamp);
        const { error } = await supabase.from('plans').upsert([payload]);
        if (error) {
          console.error('Supabase update plan error:', error.message, error);
        }
      } catch (err) {
        console.error('Supabase update plan catch error:', err);
      }
    }
  };

  const deletePlan = async (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setUsers((prev) =>
      prev.map((u) => (u.assignedPlanId === planId ? { ...u, assignedPlanId: undefined } : u))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('plans').delete().eq('id', planId);
        await supabase.from('users').update({ assigned_plan_id: null }).eq('assigned_plan_id', planId);
      } catch (err) {
        console.error('Supabase delete plan error:', err);
      }
    }
  };

  const saveWorkoutLog = async (log: WorkoutLog) => {
    setLogs((prev) => [log, ...prev.filter((l) => l.id !== log.id)]);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = mapLogToDb(log);
        const { error } = await supabase.from('workout_logs').upsert([payload]);
        if (error) {
          console.error('Supabase save log error:', error.message, error);
        }
      } catch (err) {
        console.error('Supabase save log catch error:', err);
      }
    }
  };

  const deleteWorkoutLog = async (logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('workout_logs').delete().eq('id', logId);
      } catch (err) {
        console.error('Supabase delete log error:', err);
      }
    }
  };

  const createTrainee = async (
    name: string,
    email: string,
    goal: User['goal'],
    weightKg: number,
    heightCm: number,
    extraFields?: Partial<User>
  ): Promise<User> => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'trainee',
      avatarText: initials || 'TR',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      heightCm,
      weightKg,
      targetWeightKg: extraFields?.targetWeightKg ?? (goal === 'Fat Loss & Conditioning' ? weightKg - 5 : weightKg + 4),
      goal,
      notes: extraFields?.notes || 'Newly registered athlete.',
      coachId: extraFields?.coachId ?? (currentUser?.role === 'coach' ? currentUser.id : undefined),
      ...extraFields
    };

    setUsers((prev) => [...prev, newUser]);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = mapUserToDb(newUser);
        const { error } = await supabase.from('users').upsert([payload]);
        if (error) {
          console.error('Supabase create user error:', error.message, error);
        }
      } catch (err) {
        console.error('Supabase create user catch error:', err);
      }
    }

    return newUser;
  };

  const updateUserProfile = async (userId: string, updates: Partial<User>) => {
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === userId) {
          return { ...u, ...updates };
        }
        return u;
      });
      try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save users to local storage:', e);
      }
      return next;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const existing = users.find((u) => u.id === userId);
        if (existing) {
          const merged = { ...existing, ...updates };
          const payload = mapUserToDb(merged);
          const { error } = await supabase.from('users').upsert([payload]);
          if (error) {
            console.error('Supabase update user profile error:', error.message, error);
          }
        }
      } catch (err) {
        console.error('Supabase update user profile catch error:', err);
      }
    }
  };

  const deleteUser = async (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUserId === userId) {
      const remaining = users.filter((u) => u.id !== userId);
      if (remaining.length > 0) {
        login(remaining[0].id);
      } else {
        logout();
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('users').delete().eq('id', userId);
        await supabase.from('workout_logs').delete().eq('user_id', userId);
      } catch (err) {
        console.error('Supabase delete user error:', err);
      }
    }
  };

  const updateUserNotes = async (userId: string, notes: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, notes } : u)));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('users').update({ notes }).eq('id', userId);
      } catch (err) {
        console.error('Supabase update notes error:', err);
      }
    }
  };

  const updateUserSubscription = async (userId: string, subscription: ClientSubscription) => {
    await updateUserProfile(userId, { subscription });
  };

  const updateCoachSettings = async (updates: Partial<CoachSettings>) => {
    setCoachSettings((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY_COACH_SETTINGS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save coach settings:', e);
      }
      return updated;
    });
  };

  const addExercise = async (exerciseData: Omit<Exercise, 'id'>): Promise<Exercise> => {
    const newEx: Exercise = {
      ...exerciseData,
      id: `ex-${Date.now()}`
    };

    setExercises((prev) => [...prev, newEx]);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = mapExerciseToDb(newEx);
        const { error } = await supabase.from('exercises').upsert([payload]);
        if (error) {
          console.error('Supabase exercise insert/upsert error:', error.message, error);
        }
      } catch (err) {
        console.error('Supabase add exercise catch error:', err);
      }
    }

    return newEx;
  };

  const updateExercise = async (updatedExercise: Exercise) => {
    setExercises((prev) => prev.map((e) => (e.id === updatedExercise.id ? updatedExercise : e)));

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = mapExerciseToDb(updatedExercise);
        const { error } = await supabase.from('exercises').upsert([payload]);
        if (error) {
          console.error('Supabase update exercise error:', error.message, error);
        }
      } catch (err) {
        console.error('Supabase update exercise catch error:', err);
      }
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('exercises').delete().eq('id', exerciseId);
      } catch (err) {
        console.error('Supabase delete exercise error:', err);
      }
    }
  };

  const getPlanForUser = (userId: string): WorkoutPlan | undefined => {
    const user = users.find((u) => u.id === userId);
    if (!user || !user.assignedPlanId) return undefined;
    return plans.find((p) => p.id === user.assignedPlanId);
  };

  const getUserLogs = (userId: string): WorkoutLog[] => {
    return logs.filter((l) => l.userId === userId);
  };

  const getCheckInsForUser = (userId: string): WeeklyCheckIn[] => {
    return checkIns
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const saveCheckInFeedback = async (checkInId: string, feedback: string) => {
    const updated = checkIns.map((c) => {
      if (c.id === checkInId) {
        return {
          ...c,
          coachFeedback: feedback,
          reviewed: true,
          reviewedAt: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });
    setCheckIns(updated);
    localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(updated));
  };

  const addCheckIn = async (checkIn: Omit<WeeklyCheckIn, 'id'>): Promise<WeeklyCheckIn> => {
    const newCheckIn: WeeklyCheckIn = {
      ...checkIn,
      id: `chk-${Date.now()}`
    };
    const updated = [newCheckIn, ...checkIns];
    setCheckIns(updated);
    localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(updated));

    // Update user lastCheckInDate & current weight
    await updateUserProfile(checkIn.userId, {
      weightKg: checkIn.weightKg,
      lastCheckInDate: checkIn.date
    });

    return newCheckIn;
  };

  const getDietPlanForUser = (userId: string): DietPlan | undefined => {
    const user = users.find((u) => u.id === userId);
    if (!user || !user.assignedDietPlanId) return undefined;
    return dietPlans.find((d) => d.id === user.assignedDietPlanId);
  };

  const assignDietPlanToUser = async (userId: string, dietPlanId: string) => {
    await updateUserProfile(userId, { assignedDietPlanId: dietPlanId });
  };

  const createDietPlan = async (planData: Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<DietPlan> => {
    const today = new Date().toISOString().split('T')[0];
    const newPlan: DietPlan = {
      coachId: planData.coachId ?? (currentUser?.role === 'coach' ? currentUser.id : undefined),
      ...planData,
      id: `diet-${Date.now()}`,
      createdAt: today,
      updatedAt: today
    };
    const updated = [newPlan, ...dietPlans];
    setDietPlans(updated);
    localStorage.setItem(STORAGE_KEY_DIET_PLANS, JSON.stringify(updated));
    return newPlan;
  };

  const updateDietPlan = async (updatedPlan: DietPlan) => {
    const updated = dietPlans.map((d) => (d.id === updatedPlan.id ? { ...updatedPlan, updatedAt: new Date().toISOString().split('T')[0] } : d));
    setDietPlans(updated);
    localStorage.setItem(STORAGE_KEY_DIET_PLANS, JSON.stringify(updated));
  };

  const deleteDietPlan = async (planId: string) => {
    const updated = dietPlans.filter((d) => d.id !== planId);
    setDietPlans(updated);
    localStorage.setItem(STORAGE_KEY_DIET_PLANS, JSON.stringify(updated));

    // Unassign from any user
    const updatedUsers = users.map((u) => {
      if (u.assignedDietPlanId === planId) {
        return { ...u, assignedDietPlanId: undefined };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
  };

  const getFormCheckVideosForUser = useCallback(
    (userId: string) => {
      return formCheckVideos
        .filter((f) => f.userId === userId)
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    },
    [formCheckVideos]
  );

  const addFormCheckVideo = async (video: Omit<FormCheckVideo, 'id' | 'recordedAt'>): Promise<FormCheckVideo> => {
    const newVideo: FormCheckVideo = {
      ...video,
      id: `fc-${Date.now()}`,
      recordedAt: new Date().toISOString()
    };
    const updated = [newVideo, ...formCheckVideos];
    setFormCheckVideos(updated);
    localStorage.setItem(STORAGE_KEY_FORM_CHECKS, JSON.stringify(updated));
    return newVideo;
  };

  const updateFormCheckVideo = async (videoId: string, updates: Partial<FormCheckVideo>) => {
    const updated = formCheckVideos.map((f) => (f.id === videoId ? { ...f, ...updates } : f));
    setFormCheckVideos(updated);
    localStorage.setItem(STORAGE_KEY_FORM_CHECKS, JSON.stringify(updated));
  };

  const deleteFormCheckVideo = async (videoId: string) => {
    const updated = formCheckVideos.filter((f) => f.id !== videoId);
    setFormCheckVideos(updated);
    localStorage.setItem(STORAGE_KEY_FORM_CHECKS, JSON.stringify(updated));
  };

  const contextValue = useMemo(() => ({
    currentUser,
    users,
    plans,
    exercises,
    logs,
    isLoaded,
    isSupabaseActive,
    login,
    loginWithEmail,
    logout,
    switchUser,
    assignPlanToUser,
    createPlan,
    updatePlan,
    deletePlan,
    saveWorkoutLog,
    deleteWorkoutLog,
    createTrainee,
    updateUserProfile,
    updateUserNotes,
    updateUserSubscription,
    deleteUser,
    addExercise,
    updateExercise,
    deleteExercise,
    getPlanForUser,
    getUserLogs,
    checkIns,
    dietPlans,
    getCheckInsForUser,
    saveCheckInFeedback,
    addCheckIn,
    getDietPlanForUser,
    assignDietPlanToUser,
    createDietPlan,
    updateDietPlan,
    deleteDietPlan,
    formCheckVideos,
    getFormCheckVideosForUser,
    addFormCheckVideo,
    updateFormCheckVideo,
    deleteFormCheckVideo,
    coachSettings,
    updateCoachSettings,
    refreshData
  }), [
    currentUser,
    users,
    plans,
    exercises,
    logs,
    isLoaded,
    isSupabaseActive,
    checkIns,
    dietPlans,
    formCheckVideos,
    coachSettings,
    refreshData
  ]);

  return (
    <GymContext.Provider value={contextValue}>
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
}

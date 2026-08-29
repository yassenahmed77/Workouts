'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, WorkoutPlan, Exercise, WorkoutLog } from '@/types';
import { INITIAL_USERS, INITIAL_PLANS, INITIAL_EXERCISES, INITIAL_LOGS } from '@/lib/initialData';
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
  createTrainee: (name: string, email: string, goal: User['goal'], weightKg: number, heightCm: number) => Promise<User>;
  updateUserNotes: (userId: string, notes: string) => Promise<void>;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
  deleteExercise: (exerciseId: string) => Promise<void>;
  getPlanForUser: (userId: string) => WorkoutPlan | undefined;
  getUserLogs: (userId: string) => WorkoutLog[];
  refreshData: () => Promise<void>;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const STORAGE_KEY_USERS = 'pro_gym_users_v5';
const STORAGE_KEY_PLANS = 'pro_gym_plans_v5';
const STORAGE_KEY_EXERCISES = 'pro_gym_exercises_v5';
const STORAGE_KEY_LOGS = 'pro_gym_logs_v5';
const STORAGE_KEY_CURRENT_USER_ID = 'pro_gym_active_user_id_v5';

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [plans, setPlans] = useState<WorkoutPlan[]>(INITIAL_PLANS);
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [logs, setLogs] = useState<WorkoutLog[]>(INITIAL_LOGS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);

  // Fetch all data from Supabase if configured, otherwise from localStorage
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
          setUsers(usersRes.data.map(mapDbUserToUser));
        }
        if (plansRes.data && plansRes.data.length > 0) {
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

  // Initial load and URL parameter check
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Try local storage first for quick hydration
        const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
        const storedPlans = localStorage.getItem(STORAGE_KEY_PLANS);
        const storedExercises = localStorage.getItem(STORAGE_KEY_EXERCISES);
        const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
        const storedActiveId = localStorage.getItem(STORAGE_KEY_CURRENT_USER_ID);

        if (storedUsers) setUsers(JSON.parse(storedUsers));
        if (storedPlans) setPlans(JSON.parse(storedPlans));
        if (storedExercises) setExercises(JSON.parse(storedExercises));
        if (storedLogs) setLogs(JSON.parse(storedLogs));
        if (storedActiveId) setCurrentUserId(storedActiveId);

        // 2. Fetch fresh data from Supabase if connected
        await refreshData();

        // 3. Check URL query parameters (e.g. ?user=user-rawan-1 or ?athlete=user-rawan-1)
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

  // Persist to localStorage as backup
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
      if (currentUserId) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER_ID);
      }
    } catch (e) {
      console.warn('LocalStorage sync warning:', e);
    }
  }, [users, plans, exercises, logs, currentUserId, isLoaded]);

  // Current active user
  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) || null : null;

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
    // Clear URL search params without reload
    if (typeof window !== 'undefined' && window.history.pushState) {
      const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const switchUser = (userId: string) => {
    login(userId);
  };

  const assignPlanToUser = async (userId: string, planId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, assignedPlanId: planId, status: 'active' } : u))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('users')
          .update({ assigned_plan_id: planId, status: 'active' })
          .eq('id', userId);
      } catch (err) {
        console.error('Supabase assign plan error:', err);
      }
    }
  };

  const createPlan = async (
    planData: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkoutPlan> => {
    const newPlan: WorkoutPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setPlans((prev) => [newPlan, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('plans').insert([mapPlanToDb(newPlan)]);
      } catch (err) {
        console.error('Supabase create plan error:', err);
      }
    }

    return newPlan;
  };

  const updatePlan = async (updatedPlan: WorkoutPlan) => {
    const syncedPlan = {
      ...updatedPlan,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setPlans((prev) => prev.map((p) => (p.id === syncedPlan.id ? syncedPlan : p)));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('plans').upsert([mapPlanToDb(syncedPlan)]);
      } catch (err) {
        console.error('Supabase update plan error:', err);
      }
    }
  };

  const deletePlan = async (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setUsers((prev) =>
      prev.map((u) => (u.assignedPlanId === planId ? { ...u, assignedPlanId: undefined, status: 'pending' } : u))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('plans').delete().eq('id', planId);
        await supabase
          .from('users')
          .update({ assigned_plan_id: null, status: 'pending' })
          .eq('assigned_plan_id', planId);
      } catch (err) {
        console.error('Supabase delete plan error:', err);
      }
    }
  };

  const saveWorkoutLog = async (log: WorkoutLog) => {
    setLogs((prev) => [log, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('workout_logs').insert([mapLogToDb(log)]);
      } catch (err) {
        console.error('Supabase save log error:', err);
      }
    }
  };

  const createTrainee = async (
    name: string,
    email: string,
    goal: User['goal'],
    weightKg: number,
    heightCm: number
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
      status: 'pending',
      joinedDate: new Date().toISOString().split('T')[0],
      heightCm,
      weightKg,
      targetWeightKg: weightKg,
      goal,
      notes: 'Newly registered athlete.'
    };

    setUsers((prev) => [...prev, newUser]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('users').insert([mapUserToDb(newUser)]);
      } catch (err) {
        console.error('Supabase create trainee error:', err);
      }
    }

    return newUser;
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

  return (
    <GymContext.Provider
      value={{
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
        createTrainee,
        updateUserNotes,
        addExercise,
        deleteExercise,
        getPlanForUser,
        getUserLogs,
        refreshData
      }}
    >
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

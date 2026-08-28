'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, WorkoutPlan, Exercise, WorkoutLog } from '@/types';
import { INITIAL_USERS, INITIAL_PLANS, INITIAL_EXERCISES, INITIAL_LOGS } from '@/lib/initialData';

interface GymContextType {
  currentUser: User;
  users: User[];
  plans: WorkoutPlan[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  switchUser: (userId: string) => void;
  assignPlanToUser: (userId: string, planId: string) => void;
  createPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>) => WorkoutPlan;
  updatePlan: (plan: WorkoutPlan) => void;
  deletePlan: (planId: string) => void;
  saveWorkoutLog: (log: WorkoutLog) => void;
  createTrainee: (name: string, email: string, goal: User['goal'], weightKg: number, heightCm: number) => User;
  updateUserNotes: (userId: string, notes: string) => void;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Exercise;
  getPlanForUser: (userId: string) => WorkoutPlan | undefined;
  getUserLogs: (userId: string) => WorkoutLog[];
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const STORAGE_KEY_USERS = 'pro_gym_users_v2';
const STORAGE_KEY_PLANS = 'pro_gym_plans_v2';
const STORAGE_KEY_EXERCISES = 'pro_gym_exercises_v2';
const STORAGE_KEY_LOGS = 'pro_gym_logs_v2';
const STORAGE_KEY_CURRENT_USER_ID = 'pro_gym_active_user_id_v2';

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [plans, setPlans] = useState<WorkoutPlan[]>(INITIAL_PLANS);
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [logs, setLogs] = useState<WorkoutLog[]>(INITIAL_LOGS);
  const [currentUserId, setCurrentUserId] = useState<string>('coach-1');
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
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
    } catch (e) {
      console.warn('LocalStorage hydration error, using initial seed data', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
      localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, currentUserId);
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [users, plans, exercises, logs, currentUserId, isLoaded]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const assignPlanToUser = (userId: string, planId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            assignedPlanId: planId,
            status: 'active'
          };
        }
        return u;
      })
    );
  };

  const createPlan = (planData: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): WorkoutPlan => {
    const newPlan: WorkoutPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  };

  const updatePlan = (updatedPlan: WorkoutPlan) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? { ...updatedPlan, updatedAt: new Date().toISOString().split('T')[0] } : p))
    );
  };

  const deletePlan = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    // Remove assignment from users if assigned
    setUsers((prev) =>
      prev.map((u) => (u.assignedPlanId === planId ? { ...u, assignedPlanId: undefined, status: 'pending' } : u))
    );
  };

  const saveWorkoutLog = (log: WorkoutLog) => {
    setLogs((prev) => [log, ...prev]);
  };

  const createTrainee = (
    name: string,
    email: string,
    goal: User['goal'],
    weightKg: number,
    heightCm: number
  ): User => {
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
      notes: 'Newly registered trainee.'
    };

    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUserNotes = (userId: string, notes: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, notes } : u)));
  };

  const addExercise = (exerciseData: Omit<Exercise, 'id'>): Exercise => {
    const newEx: Exercise = {
      ...exerciseData,
      id: `ex-${Date.now()}`
    };
    setExercises((prev) => [...prev, newEx]);
    return newEx;
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
        switchUser,
        assignPlanToUser,
        createPlan,
        updatePlan,
        deletePlan,
        saveWorkoutLog,
        createTrainee,
        updateUserNotes,
        addExercise,
        getPlanForUser,
        getUserLogs
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

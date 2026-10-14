/**
 * @file GymContext.jsx
 * @description سياق إدارة الحالة العامة لكامل التطبيق (Global State Provider)
 * يدير المتدربين والخطط والتمارين والوجبات وتخزينها محلياً وسحابياً.
 */

'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_USERS, INITIAL_PLANS, INITIAL_EXERCISES, INITIAL_LOGS, INITIAL_CHECK_INS, INITIAL_DIET_PLANS, INITIAL_FORM_CHECKS, INITIAL_COACH_SETTINGS } from '@/lib/initialData';
import { supabase, isSupabaseConfigured, mapDbUserToUser, mapUserToDb, mapDbPlanToPlan, mapPlanToDb, mapDbExerciseToExercise, mapExerciseToDb, mapDbLogToLog, mapLogToDb } from '@/lib/supabase';
const GymContext = createContext(undefined);
const STORAGE_KEY_USERS = 'pro_gym_users_v11';
const STORAGE_KEY_PLANS = 'pro_gym_plans_v9';
const STORAGE_KEY_EXERCISES = 'pro_gym_exercises_v9';
const STORAGE_KEY_LOGS = 'pro_gym_logs_v9';
const STORAGE_KEY_CURRENT_USER_ID = 'pro_gym_active_user_id_v9';
const STORAGE_KEY_CHECKINS = 'pro_gym_checkins_v10';
const STORAGE_KEY_DIET_PLANS = 'pro_gym_diet_plans_v10';
const STORAGE_KEY_FORM_CHECKS = 'pro_gym_form_checks_v1';
const STORAGE_KEY_COACH_SETTINGS = 'pro_gym_coach_settings_v1';
export function GymProvider({ children }) {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [plans, setPlans] = useState(INITIAL_PLANS);
    const [exercises, setExercises] = useState(INITIAL_EXERCISES);
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [checkIns, setCheckIns] = useState(INITIAL_CHECK_INS);
    const [dietPlans, setDietPlans] = useState(INITIAL_DIET_PLANS);
    const [formCheckVideos, setFormCheckVideos] = useState(INITIAL_FORM_CHECKS);
    const [coachSettings, setCoachSettings] = useState(INITIAL_COACH_SETTINGS);
    const [currentUserId, setCurrentUserId] = useState(null);
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
                    const cachedUsersMap = new Map();
                    if (storedUsersRaw) {
                        try {
                            const cached = JSON.parse(storedUsersRaw);
                            cached.forEach((u) => cachedUsersMap.set(u.id, u));
                        }
                        catch (e) { }
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
            }
            catch (err) {
                console.warn('Supabase fetch failed, falling back to cached local storage:', err);
                setIsSupabaseActive(false);
            }
        }
    }, []);
    useEffect(() => {
        const init = async () => {
            // Safe JSON parsing helper to ensure corrupted items do not crash initialization
            const safeParseJSON = (raw, fallback) => {
                if (!raw)
                    return fallback;
                try {
                    return JSON.parse(raw);
                }
                catch (e) {
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
                    const parsed = safeParseJSON(storedUsers, INITIAL_USERS);
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
                }
                else {
                    setUsers(INITIAL_USERS);
                }
                if (storedPlans !== null) {
                    const parsed = safeParseJSON(storedPlans, INITIAL_PLANS);
                    const existingIds = new Set(parsed.map((p) => p.id));
                    const missingPlans = INITIAL_PLANS.filter((p) => !existingIds.has(p.id));
                    setPlans([...parsed, ...missingPlans]);
                }
                else {
                    setPlans(INITIAL_PLANS);
                }
                if (storedLogs !== null) {
                    const parsedLogs = safeParseJSON(storedLogs, INITIAL_LOGS);
                    if (parsedLogs.length === 0) {
                        setLogs(INITIAL_LOGS);
                    }
                    else {
                        const existingLogIds = new Set(parsedLogs.map((l) => l.id));
                        const missingLogs = INITIAL_LOGS.filter((l) => !existingLogIds.has(l.id));
                        setLogs([...parsedLogs, ...missingLogs]);
                    }
                }
                else {
                    setLogs(INITIAL_LOGS);
                }
                if (storedCheckIns !== null) {
                    const parsedCheckIns = safeParseJSON(storedCheckIns, INITIAL_CHECK_INS);
                    if (parsedCheckIns.length === 0) {
                        setCheckIns(INITIAL_CHECK_INS);
                    }
                    else {
                        const existingIds = new Set(parsedCheckIns.map((c) => c.id));
                        const missingCheckIns = INITIAL_CHECK_INS.filter((c) => !existingIds.has(c.id));
                        setCheckIns([...parsedCheckIns, ...missingCheckIns]);
                    }
                }
                else {
                    setCheckIns(INITIAL_CHECK_INS);
                }
                if (storedDietPlans !== null) {
                    const parsed = safeParseJSON(storedDietPlans, INITIAL_DIET_PLANS);
                    const existingIds = new Set(parsed.map((d) => d.id));
                    const missingDiet = INITIAL_DIET_PLANS.filter((d) => !existingIds.has(d.id));
                    setDietPlans([...parsed, ...missingDiet]);
                }
                else {
                    setDietPlans(INITIAL_DIET_PLANS);
                }
                if (storedFormChecks !== null) {
                    const parsed = safeParseJSON(storedFormChecks, INITIAL_FORM_CHECKS);
                    const existingIds = new Set(parsed.map((f) => f.id));
                    const missingChecks = INITIAL_FORM_CHECKS.filter((f) => !existingIds.has(f.id));
                    setFormCheckVideos([...parsed, ...missingChecks]);
                }
                else {
                    setFormCheckVideos(INITIAL_FORM_CHECKS);
                }
                if (storedCoachSettings !== null) {
                    const parsed = safeParseJSON(storedCoachSettings, INITIAL_COACH_SETTINGS);
                    setCoachSettings({ ...INITIAL_COACH_SETTINGS, ...parsed });
                }
                else {
                    setCoachSettings(INITIAL_COACH_SETTINGS);
                }
                if (storedActiveId)
                    setCurrentUserId(storedActiveId);
                else
                    setCurrentUserId('user-rawan-1');
                await refreshData();
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    const directUserParam = params.get('user') || params.get('athlete') || params.get('trainee');
                    if (directUserParam) {
                        setCurrentUserId(directUserParam);
                        localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, directUserParam);
                    }
                }
            }
            catch (e) {
                console.error('Initialization error:', e);
            }
            finally {
                setIsLoaded(true);
            }
        };
        init();
    }, [refreshData]);
    useEffect(() => {
        if (!isLoaded)
            return;
        // Guard against data wipeout: never overwrite storage with empty arrays if initial state exists
        if (users.length === 0 && INITIAL_USERS.length > 0)
            return;
        try {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
            localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
            localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
            localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
            localStorage.setItem(STORAGE_KEY_FORM_CHECKS, JSON.stringify(formCheckVideos));
            localStorage.setItem(STORAGE_KEY_COACH_SETTINGS, JSON.stringify(coachSettings));
            if (currentUserId)
                localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, currentUserId);
            else
                localStorage.removeItem(STORAGE_KEY_CURRENT_USER_ID);
        }
        catch (e) {
            console.warn('LocalStorage sync warning:', e);
        }
    }, [users, plans, exercises, logs, formCheckVideos, coachSettings, currentUserId, isLoaded]);
    const currentUser = useMemo(() => {
        return currentUserId ? users.find((u) => u.id === currentUserId) || null : null;
    }, [currentUserId, users]);
    const login = (userId) => {
        setCurrentUserId(userId);
        localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, userId);
    };
    const loginWithEmail = (email) => {
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
    const switchUser = (userId) => {
        login(userId);
    };
    const assignPlanToUser = async (userId, planId) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, assignedPlanId: planId } : u)));
        if (isSupabaseConfigured && supabase) {
            try {
                await supabase
                    .from('users')
                    .update({ assigned_plan_id: planId })
                    .eq('id', userId);
            }
            catch (err) {
                console.error('Supabase assign plan error:', err);
            }
        }
    };
    const createPlan = async (planData) => {
        const now = new Date().toISOString();
        const newPlan = {
            coachId: planData.coachId ?? (currentUser?.role === 'coach' ? currentUser.id : undefined),
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
            }
            catch (err) {
                console.error('Supabase create plan catch error:', err);
            }
        }
        return newPlan;
    };
    const updatePlan = async (updatedPlan) => {
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
            }
            catch (err) {
                console.error('Supabase update plan catch error:', err);
            }
        }
    };
    const deletePlan = async (planId) => {
        setPlans((prev) => prev.filter((p) => p.id !== planId));
        setUsers((prev) => prev.map((u) => (u.assignedPlanId === planId ? { ...u, assignedPlanId: undefined } : u)));
        if (isSupabaseConfigured && supabase) {
            try {
                await supabase.from('plans').delete().eq('id', planId);
                await supabase.from('users').update({ assigned_plan_id: null }).eq('assigned_plan_id', planId);
            }
            catch (err) {
                console.error('Supabase delete plan error:', err);
            }
        }
    };
    const saveWorkoutLog = async (log) => {
        setLogs((prev) => [log, ...prev.filter((l) => l.id !== log.id)]);
        if (isSupabaseConfigured && supabase) {
            try {
                const payload = mapLogToDb(log);
                const { error } = await supabase.from('workout_logs').upsert([payload]);
                if (error) {
                    console.error('Supabase save log error:', error.message, error);
                }
            }
            catch (err) {
                console.error('Supabase save log catch error:', err);
            }
        }
    };
    const deleteWorkoutLog = async (logId) => {
        setLogs((prev) => prev.filter((l) => l.id !== logId));
        if (isSupabaseConfigured && supabase) {
            try {
                await supabase.from('workout_logs').delete().eq('id', logId);
            }
            catch (err) {
                console.error('Supabase delete log error:', err);
            }
        }
    };
    const createTrainee = async (name, email, goal, weightKg, heightCm, extraFields) => {
        const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        const newUser = {
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
            }
            catch (err) {
                console.error('Supabase create user catch error:', err);
            }
        }
        return newUser;
    };
    const updateUserProfile = async (userId, updates) => {
        setUsers((prev) => {
            const next = prev.map((u) => {
                if (u.id === userId) {
                    return { ...u, ...updates };
                }
                return u;
            });
            try {
                localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(next));
            }
            catch (e) {
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
            }
            catch (err) {
                console.error('Supabase update user profile catch error:', err);
            }
        }
    };
    const deleteUser = async (userId) => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (currentUserId === userId) {
            const remaining = users.filter((u) => u.id !== userId);
            if (remaining.length > 0) {
                login(remaining[0].id);
            }
            else {
                logout();
            }
        }
        if (isSupabaseConfigured && supabase) {
            try {
                await supabase.from('users').delete().eq('id', userId);
                await supabase.from('workout_logs').delete().eq('user_id', userId);
            }
            catch (err) {
                console.error('Supabase delete user error:', err);
            }
        }
    };
    const updateUserNotes = async (userId, notes) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, notes } : u)));
        if (isSupabaseConfigured && supabase) {
            try {
                await supabase.from('users').update({ notes }).eq('id', userId);
            }
            catch (err) {
                console.error('Supabase update notes error:', err);
            }
        }
    };
    const updateUserSubscription = async (userId, subscription) => {
        await updateUserProfile(userId, { subscription });
    };
    const updateCoachSettings = async (updates) => {
        setCoachSettings((prev) => {
            const updated = { ...prev, ...updates };
            try {
                localStorage.setItem(STORAGE_KEY_COACH_SETTINGS, JSON.stringify(updated));
            }
            catch (e) {
                console.error('Failed to save coach settings:', e);
            }
            return updated;
        });
    };
    const addExercise = async (exerciseData) => {
        const newEx = {
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
            }
            catch (err) {
                console.error('Supabase add exercise catch error:', err);
            }
        }
        return newEx;
    };
    const updateExercise = async (updatedExercise) => {
        setExercises((prev) => prev.map((e) => (e.id === updatedExercise.id ? updatedExercise : e)));
        if (isSupabaseConfigured && supabase) {
            try {
                const payload = mapExerciseToDb(updatedExercise);
                const { error } = await supabase.from('exercises').upsert([payload]);
                if (error) {
                    console.error('Supabase update exercise error:', error.message, error);
                }
            }
            catch (err) {
                console.error('Supabase update exercise catch error:', err);
            }
        }
    };
    const deleteExercise = async (exerciseId) => {
        setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
        if (isSupabaseConfigured && supabase) {
            try {
                await supabase.from('exercises').delete().eq('id', exerciseId);
            }
            catch (err) {
                console.error('Supabase delete exercise error:', err);
            }
        }
    };
    const getPlanForUser = (userId) => {
        const user = users.find((u) => u.id === userId);
        if (!user || !user.assignedPlanId)
            return undefined;
        return plans.find((p) => p.id === user.assignedPlanId);
    };
    const getUserLogs = (userId) => {
        return logs.filter((l) => l.userId === userId);
    };
    const getCheckInsForUser = (userId) => {
        return checkIns
            .filter((c) => c.userId === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };
    const saveCheckInFeedback = async (checkInId, feedback) => {
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
    const addCheckIn = async (checkIn) => {
        const newCheckIn = {
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
    const getDietPlanForUser = (userId) => {
        const user = users.find((u) => u.id === userId);
        if (!user || !user.assignedDietPlanId)
            return undefined;
        return dietPlans.find((d) => d.id === user.assignedDietPlanId);
    };
    const assignDietPlanToUser = async (userId, dietPlanId) => {
        await updateUserProfile(userId, { assignedDietPlanId: dietPlanId });
    };
    const createDietPlan = async (planData) => {
        const today = new Date().toISOString().split('T')[0];
        const newPlan = {
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
    const updateDietPlan = async (updatedPlan) => {
        const updated = dietPlans.map((d) => (d.id === updatedPlan.id ? { ...updatedPlan, updatedAt: new Date().toISOString().split('T')[0] } : d));
        setDietPlans(updated);
        localStorage.setItem(STORAGE_KEY_DIET_PLANS, JSON.stringify(updated));
    };
    const deleteDietPlan = async (planId) => {
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
    const getFormCheckVideosForUser = useCallback((userId) => {
        return formCheckVideos
            .filter((f) => f.userId === userId)
            .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    }, [formCheckVideos]);
    const addFormCheckVideo = async (video) => {
        const newVideo = {
            ...video,
            id: `fc-${Date.now()}`,
            recordedAt: new Date().toISOString()
        };
        const updated = [newVideo, ...formCheckVideos];
        setFormCheckVideos(updated);
        localStorage.setItem(STORAGE_KEY_FORM_CHECKS, JSON.stringify(updated));
        return newVideo;
    };
    const updateFormCheckVideo = async (videoId, updates) => {
        const updated = formCheckVideos.map((f) => (f.id === videoId ? { ...f, ...updates } : f));
        setFormCheckVideos(updated);
        localStorage.setItem(STORAGE_KEY_FORM_CHECKS, JSON.stringify(updated));
    };
    const deleteFormCheckVideo = async (videoId) => {
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
    return (<GymContext.Provider value={contextValue}>
      {children}
    </GymContext.Provider>);
}
export function useGym() {
    const context = useContext(GymContext);
    if (!context) {
        throw new Error('useGym must be used within a GymProvider');
    }
    return context;
}

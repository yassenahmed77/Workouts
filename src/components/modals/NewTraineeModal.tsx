'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, UserGoal, CompetitorDivision, SubscriptionPlanType } from '@/types';
import { clientService } from '@/services/clientService';
import { sanitizeString, sanitizeNotes } from '@/lib/sanitizer';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { DatePicker } from '@/components/ui/DatePicker';

interface NewTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSelect?: (userId: string) => void;
  onNavigateToStudio?: (targetUserId: string) => void;
  onNavigateToDietStudio?: (targetUserId: string) => void;
  onNavigateToClient360?: (user: User) => void;
}

const GOALS: UserGoal[] = [
  'Hypertrophy / Muscle Gain',
  'Strength & Power',
  'Fat Loss & Conditioning',
  'Athletic Performance',
  'Rehabilitation & Mobility'
];

const COMPETITOR_DIVISIONS: CompetitorDivision[] = [
  'Classic Physique',
  "Men's Physique",
  'Open Bodybuilding',
  'Bikini Pro',
  'Figure'
];

const SUBSCRIPTION_PLANS: SubscriptionPlanType[] = [
  'Full VIP Coaching',
  'Workout Only',
  'Nutrition Only',
  'Contest Prep',
  'Custom Coaching'
];

export const NewTraineeModal: React.FC<NewTraineeModalProps> = ({
  isOpen,
  onClose,
  onSuccessSelect,
  onNavigateToStudio,
  onNavigateToDietStudio,
  onNavigateToClient360
}) => {
  const { createTrainee, coachSettings, users } = useGym();
  const { showToast } = useToast();

  // Multi-step sequential flow
  const [currentStep, setCurrentStep] = useState<'profile' | 'workout' | 'diet'>('profile');
  const [createdAthlete, setCreatedAthlete] = useState<User | null>(null);

  // Mobile segmented substep (0ms switch, zero scroll)
  const [mobileTab, setMobileTab] = useState<'info' | 'membership'>('info');

  // Secondary account flag when duplicate is detected
  const [isSecondaryAccountAllowed, setIsSecondaryAccountAllowed] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+20 ');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [goal, setGoal] = useState<UserGoal>('Hypertrophy / Muscle Gain');
  const [notes, setNotes] = useState('');
  const [isCompetitor, setIsCompetitor] = useState(false);
  const [division, setDivision] = useState<CompetitorDivision>('Classic Physique');
  const [targetShow, setTargetShow] = useState('NPC Egypt Muscle Showdown');

  // Subscription Details
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlanType>('Full VIP Coaching');
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [subscriptionPrice, setSubscriptionPrice] = useState<string>('6000');

  // Field Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time Duplicate Account Detection
  const existingAthlete = useMemo(() => {
    if (!users || users.length === 0) return null;
    return clientService.findExistingAthlete(users, email, phone);
  }, [users, email, phone]);

  // Real-time Target Weight vs Goal Logic
  const goalWeightValidation = useMemo(() => {
    const curr = parseFloat(weightKg);
    const tgt = parseFloat(targetWeightKg);
    return clientService.validateGoalWeight(goal, curr, tgt);
  }, [goal, weightKg, targetWeightKg]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const calculateEndDate = (start: string, months: number): string => {
    try {
      const parts = start.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        const d = new Date(parts[0], parts[1] - 1 + months, parts[2]);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
      return start;
    } catch {
      return start;
    }
  };

  const findPackagePrice = (plan: SubscriptionPlanType, months: number): string => {
    const pkg = coachSettings?.packages?.find(
      (p) => p.name === plan && p.durationMonths === months
    );
    if (pkg) return String(pkg.price);
    if (plan === 'Full VIP Coaching') return String(months === 1 ? 2500 : months === 3 ? 6000 : months === 6 ? 10500 : 18000);
    if (plan === 'Workout Only') return String(months * 1200);
    if (plan === 'Nutrition Only') return String(months * 1000);
    if (plan === 'Contest Prep') return String(months * 2200);
    return String(months * 1500);
  };

  const handleSelectPlanType = (newPlan: SubscriptionPlanType) => {
    setSubscriptionPlan(newPlan);
    setSubscriptionPrice(findPackagePrice(newPlan, durationMonths));
  };

  const handleSelectDuration = (months: number) => {
    setDurationMonths(months);
    setEndDate(calculateEndDate(startDate, months));
    setSubscriptionPrice(findPackagePrice(subscriptionPlan, months));
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setEndDate(calculateEndDate(newStart, durationMonths));
  };

  // Reset modal state whenever opened fresh
  const resetForm = () => {
    setCurrentStep('profile');
    setMobileTab('info');
    setIsSecondaryAccountAllowed(false);
    setCreatedAthlete(null);
    setName('');
    setEmail('');
    setPhone('+20 ');
    setGender('Male');
    setAge('');
    setWeightKg('');
    setTargetWeightKg('');
    setHeightCm('');
    setBodyFatPercentage('');
    setGoal('Hypertrophy / Muscle Gain');
    setNotes('');
    setIsCompetitor(false);
    setDivision('Classic Physique');
    setTargetShow('NPC Egypt Muscle Showdown');
    
    // Reset subscription defaults
    setSubscriptionPlan('Full VIP Coaching');
    setDurationMonths(3);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(calculateEndDate(today, 3));
    setSubscriptionPrice('6000');

    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGoalChange = (newGoal: UserGoal) => {
    setGoal(newGoal);
    const curr = parseFloat(weightKg);
    if (!isNaN(curr) && curr > 0) {
      if (newGoal === 'Fat Loss & Conditioning') {
        setTargetWeightKg(String(Math.max(40, curr - 5)));
      } else if (newGoal === 'Hypertrophy / Muscle Gain') {
        setTargetWeightKg(String(curr + 4));
      } else if (newGoal === 'Rehabilitation & Mobility') {
        setTargetWeightKg(String(curr));
      }
    }
    if (errors.targetWeightKg) {
      setErrors(prev => ({ ...prev, targetWeightKg: '' }));
    }
  };

  // Comprehensive validation for all required fields using Zod and domain engines
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    const parsedWeight = parseFloat(weightKg);
    const parsedTargetWeight = parseFloat(targetWeightKg);
    const parsedHeight = parseFloat(heightCm);
    const parsedAge = age ? parseInt(age, 10) : undefined;
    const parsedPrice = subscriptionPrice ? parseFloat(subscriptionPrice) : undefined;
    const parsedBodyFat = bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined;

    const validation = clientService.validateCreate({
      name: sanitizeString(name),
      email: email.trim().toLowerCase(),
      phone: sanitizeString(phone),
      gender,
      age: parsedAge,
      heightCm: isNaN(parsedHeight) ? 0 : parsedHeight,
      weightKg: isNaN(parsedWeight) ? 0 : parsedWeight,
      targetWeightKg: isNaN(parsedTargetWeight) ? 0 : parsedTargetWeight,
      goal,
      status: 'active',
      bodyFatPercentage: parsedBodyFat,
      notes: notes ? sanitizeNotes(notes) : undefined,
      isCompetitor,
      subscription: {
        planType: subscriptionPlan,
        durationMonths,
        startDate,
        endDate,
        price: parsedPrice,
        currency: coachSettings?.currency || 'EGP',
        status: 'active',
        notes: notes ? sanitizeNotes(notes) : undefined
      }
    });

    if (!validation.success) {
      validation.errors.forEach((errStr) => {
        const [field, msg] = errStr.split(': ');
        if (field === 'name') errs.name = 'Required (2-60 chars)';
        else if (field === 'email') errs.email = 'Valid email required';
        else if (field === 'heightCm') errs.heightCm = '100-250 cm';
        else if (field === 'weightKg') errs.weightKg = '30-300 kg';
        else if (field === 'targetWeightKg') errs.targetWeightKg = '30-300 kg';
        else if (field === 'age') errs.age = '12-100 yrs';
        else errs[field] = msg || 'Invalid';
      });
    }

    // Goal vs Target Weight Consistency Check
    if (!isNaN(parsedWeight) && !isNaN(parsedTargetWeight)) {
      const goalCheck = clientService.validateGoalWeight(goal, parsedWeight, parsedTargetWeight);
      if (!goalCheck.isValid && goalCheck.error) {
        errs.targetWeightKg = goalCheck.error;
      }
    }

    // Duplicate Athlete Account Interlock
    if (existingAthlete && !isSecondaryAccountAllowed) {
      errs.duplicate = 'Athlete already exists. Select an option to proceed.';
    }

    // Competitor Show name if competitor is checked
    if (isCompetitor && !targetShow.trim()) {
      errs.targetShow = 'Required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // STEP 1: Save athlete profile & advance to custom plan step
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1()) {
      if (errors.duplicate || (existingAthlete && !isSecondaryAccountAllowed)) {
        showToast('Existing athlete account detected. Choose an action above.', 'error');
      } else {
        showToast('Please fix the indicated form fields', 'error');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const extraFields: Partial<User> = {
        phone: sanitizeString(phone),
        gender,
        age: age ? parseInt(age, 10) : undefined,
        targetWeightKg: parseFloat(targetWeightKg),
        bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
        notes: notes ? sanitizeNotes(notes) : undefined,
        isCompetitor,
        subscription: {
          planType: subscriptionPlan,
          durationMonths,
          startDate,
          endDate,
          price: subscriptionPrice ? parseFloat(subscriptionPrice) : undefined,
          currency: coachSettings?.currency || 'EGP',
          status: 'active',
          notes: notes ? sanitizeNotes(notes) : undefined
        },
        competitionProfile: isCompetitor ? {
          targetShow: sanitizeString(targetShow),
          showDate: '2026-11-20',
          division,
          targetWeightClassKg: parseFloat(targetWeightKg),
          currentWeightKg: parseFloat(weightKg),
          prepPhase: 'Prep Phase (16w)',
          stageReadinessScore: 80,
          posingApproval: 'Pending Review',
          daysOut: 56,
          waterIntakeLiters: 4,
          carbLoadGrams: 250,
        } : undefined
      };

      const newTrainee = await createTrainee(
        sanitizeString(name),
        email.trim().toLowerCase(),
        goal,
        parseFloat(weightKg),
        parseFloat(heightCm),
        extraFields
      );

      setCreatedAthlete(newTrainee);
      showToast(`Athlete ${newTrainee.name} registered`, 'success');
      setCurrentStep('workout');
    } catch (err) {
      console.error('Failed to create athlete:', err);
      showToast('Could not register athlete. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Custom workout plan options
  const handleOpenSplitsStudio = () => {
    if (!createdAthlete) return;
    const athlete = createdAthlete;
    handleClose();
    if (onNavigateToStudio) onNavigateToStudio(athlete.id);
    else if (onSuccessSelect) onSuccessSelect(athlete.id);
  };

  const handleSkipWorkout = () => {
    setCurrentStep('diet');
  };

  // STEP 3: Custom diet options
  const handleOpenDietStudio = () => {
    if (!createdAthlete) return;
    const athlete = createdAthlete;
    handleClose();
    if (onNavigateToDietStudio) onNavigateToDietStudio(athlete.id);
    else if (onSuccessSelect) onSuccessSelect(athlete.id);
  };

  const handleCompleteSetup = () => {
    if (!createdAthlete) return;
    const athlete = createdAthlete;
    showToast(`Onboarding finished for ${athlete.name}`, 'success');
    handleClose();
    if (onNavigateToClient360) onNavigateToClient360(athlete);
    else if (onSuccessSelect) onSuccessSelect(athlete.id);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`w-full ${currentStep === 'profile' ? 'max-w-4xl' : 'max-w-lg'} bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 cursor-default max-h-[96dvh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* STEP 1: ATHLETE REGISTRATION (WEBSITE THEME TOKENS, ZERO SCROLL)          */}
        {/* ========================================================================= */}
        {currentStep === 'profile' && (
          <form onSubmit={handleSaveProfile} className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="gym-heading-page text-sm sm:text-base">
                  Register New Athlete
                </h2>
                <p className="gym-subtext text-[10px] sm:text-[11px] mt-0.5">
                  Basic info &amp; biometrics &bull; Step 1 of 3
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isSecondaryAccountAllowed && existingAthlete && (
                  <span className="hidden sm:inline-flex text-[9px] font-mono px-2 py-0.5 rounded-full bg-[var(--main-color)]/15 border border-[var(--main-color)]/30 text-[var(--main-color)]">
                    Secondary Account
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-medium cursor-pointer"
                  title="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Mobile Substep Segmented Navigation (Only on mobile < sm:) */}
            <div className="sm:hidden grid grid-cols-2 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)]/80 flex-shrink-0">
              <button
                type="button"
                onClick={() => setMobileTab('info')}
                className={`py-2 text-[11px] font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  mobileTab === 'info'
                    ? 'text-[var(--main-color)] border-[var(--main-color)] bg-[var(--main-color)]/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                1. Athlete &amp; Biometrics
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('membership')}
                className={`py-2 text-[11px] font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  mobileTab === 'membership'
                    ? 'text-[var(--main-color)] border-[var(--main-color)] bg-[var(--main-color)]/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                2. Membership &amp; Notes
              </button>
            </div>

            {/* Form Body: Responsive 2-Column Desktop Grid / 1-Screen Mobile Tabs */}
            <div className="p-3 sm:p-4.5 space-y-3 overflow-y-auto sm:overflow-hidden custom-scrollbar flex-1">
              
              {/* Existing Athlete Duplicate Detection Banner */}
              {existingAthlete && !isSecondaryAccountAllowed && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col gap-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[11px] font-semibold text-amber-300">
                        Athlete Account Already Exists
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">
                      Matched by {existingAthlete.email?.toLowerCase() === email.trim().toLowerCase() ? 'Email' : 'Phone'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--card-bg)] border border-white/[0.06]">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-full bg-[var(--main-color)]/20 border border-[var(--main-color)]/40 flex items-center justify-center text-[11px] font-bold text-[var(--main-color)] font-mono flex-shrink-0">
                        {clientService.getInitials(existingAthlete.name)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                          <span className="truncate">{existingAthlete.name}</span>
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex-shrink-0">
                            {existingAthlete.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {existingAthlete.phone || 'No phone'} &bull; {existingAthlete.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 flex-shrink-0 pl-2">
                      <div className="text-white font-medium">{existingAthlete.goal}</div>
                      <div className="text-[9px] font-mono text-[var(--main-color)]">
                        {existingAthlete.subscription?.planType || 'Standard Plan'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        if (onNavigateToClient360) onNavigateToClient360(existingAthlete);
                        else if (onSuccessSelect) onSuccessSelect(existingAthlete.id);
                        showToast(`Opened existing profile for ${existingAthlete.name}`, 'info');
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[var(--main-color)] hover:bg-[var(--main-color-hover)] text-white text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
                    >
                      Continue with Existing Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSecondaryAccountAllowed(true);
                        setErrors(prev => ({ ...prev, duplicate: '' }));
                        showToast('Secondary account mode enabled', 'info');
                      }}
                      className="py-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1] text-xs font-semibold transition-all cursor-pointer"
                    >
                      Create Secondary Account
                    </button>
                  </div>
                </div>
              )}

              {/* 2-Column Responsive Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
                
                {/* ========================================================================= */}
                {/* COLUMN 1: ATHLETE IDENTITY, BIOMETRICS & GOAL                            */}
                {/* ========================================================================= */}
                <div className={`space-y-2.5 ${mobileTab === 'info' ? 'block' : 'hidden sm:block'}`}>
                  {/* Full Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      {errors.name && (
                        <span className="text-[9px] text-rose-400 font-mono font-medium">{errors.name}</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                      }}
                      placeholder="e.g. Youssef Adel"
                      className={`w-full px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors h-8 ${
                        errors.name ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                      }`}
                    />
                  </div>

                  {/* Phone & Email side-by-side */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate">
                          Phone / WhatsApp <span className="text-rose-400">*</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                        }}
                        placeholder="+20 101 234 5678"
                        className={`w-full px-2.5 py-1.5 rounded-xl bg-[var(--input-bg)] border text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-colors h-8 ${
                          errors.phone ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate">
                          Email Address <span className="text-rose-400">*</span>
                        </label>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                        }}
                        placeholder="athlete@domain.com"
                        className={`w-full px-2.5 py-1.5 rounded-xl bg-[var(--input-bg)] border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors h-8 ${
                          errors.email ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Gender & Age side-by-side (Gender 60%, Age 40% - No Text Truncation!) */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                        Gender
                      </label>
                      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] h-8">
                        <button
                          type="button"
                          onClick={() => setGender('Male')}
                          className={`flex-1 h-6 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            gender === 'Male'
                              ? 'bg-[var(--main-color)]/15 border border-[var(--main-color)]/35 text-[var(--main-color)] shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender('Female')}
                          className={`flex-1 h-6 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            gender === 'Female'
                              ? 'bg-[var(--main-color)]/15 border border-[var(--main-color)]/35 text-[var(--main-color)] shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>

                    <div className="col-span-5">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate">
                          Age <span className="text-rose-400">*</span>
                        </label>
                        {errors.age && (
                          <span className="text-[9px] text-rose-400 font-mono">{errors.age}</span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="12"
                        max="100"
                        value={age}
                        onChange={(e) => {
                          setAge(e.target.value);
                          if (errors.age) setErrors(prev => ({ ...prev, age: '' }));
                        }}
                        placeholder="24"
                        className={`w-full px-2.5 py-1.5 rounded-xl bg-[var(--input-bg)] border text-xs text-white focus:outline-none transition-colors text-center h-8 font-mono ${
                          errors.age ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Biometrics Card with Dynamic Trajectory Badge */}
                  <div className="p-2.5 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Biometrics &amp; Weight
                      </span>
                      {weightKg && targetWeightKg && !isNaN(parseFloat(weightKg)) && !isNaN(parseFloat(targetWeightKg)) && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          !goalWeightValidation.isValid
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : goalWeightValidation.trend === 'loss'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : goalWeightValidation.trend === 'gain'
                            ? 'bg-[var(--main-color)]/15 text-[var(--main-color)] border border-[var(--main-color)]/30'
                            : 'bg-white/[0.06] text-slate-400 border border-white/[0.08]'
                        }`}>
                          {goalWeightValidation.deltaKg > 0 ? `+${goalWeightValidation.deltaKg}` : goalWeightValidation.deltaKg} kg
                          {' '}({goalWeightValidation.trend === 'loss' ? 'Loss' : goalWeightValidation.trend === 'gain' ? 'Gain' : 'Maintain'})
                        </span>
                      )}
                    </div>

                    {/* 4 Cells: 2x2 on Mobile, 4 in 1 row on Desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-400 mb-0.5 font-medium truncate">
                          Current (kg) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={weightKg}
                          onChange={(e) => {
                            setWeightKg(e.target.value);
                            if (errors.weightKg) setErrors(prev => ({ ...prev, weightKg: '' }));
                          }}
                          placeholder="75"
                          className={`w-full px-2 py-1 rounded-lg bg-[var(--input-bg)] border text-xs font-numeric font-medium text-white placeholder-slate-500 focus:outline-none text-center h-7.5 ${
                            errors.weightKg ? 'border-rose-500/70' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 mb-0.5 font-medium truncate">
                          Target (kg) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={targetWeightKg}
                          onChange={(e) => {
                            setTargetWeightKg(e.target.value);
                            if (errors.targetWeightKg) setErrors(prev => ({ ...prev, targetWeightKg: '' }));
                          }}
                          placeholder="78"
                          className={`w-full px-2 py-1 rounded-lg bg-[var(--input-bg)] border text-xs font-numeric font-medium text-white placeholder-slate-500 focus:outline-none text-center h-7.5 ${
                            errors.targetWeightKg || !goalWeightValidation.isValid ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 mb-0.5 font-medium truncate">
                          Height (cm) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => {
                            setHeightCm(e.target.value);
                            if (errors.heightCm) setErrors(prev => ({ ...prev, heightCm: '' }));
                          }}
                          placeholder="178"
                          className={`w-full px-2 py-1 rounded-lg bg-[var(--input-bg)] border text-xs font-numeric font-medium text-white placeholder-slate-500 focus:outline-none text-center h-7.5 ${
                            errors.heightCm ? 'border-rose-500/70' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 mb-0.5 font-medium truncate">
                          Body Fat %
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={bodyFatPercentage}
                          onChange={(e) => setBodyFatPercentage(e.target.value)}
                          placeholder="14%"
                          className="w-full px-2 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-numeric font-medium text-white focus:outline-none focus:border-[var(--main-color)] text-center placeholder-slate-600 h-7.5"
                        />
                      </div>
                    </div>

                    {/* Conflict Error Message below biometrics */}
                    {!goalWeightValidation.isValid && goalWeightValidation.error && (
                      <p className="text-[9px] text-rose-400 font-mono mt-1 font-medium">
                        &bull; {goalWeightValidation.error}
                      </p>
                    )}
                  </div>

                  {/* Primary Goal (Template SelectDropdown - Zero HTML Native Select!) */}
                  <div>
                    <SelectDropdown
                      label="Primary Goal"
                      required
                      value={goal}
                      onChange={(val) => handleGoalChange(val as UserGoal)}
                      options={GOALS}
                    />
                  </div>

                  {/* Competitor Modern Switch */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsCompetitor(!isCompetitor)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl border transition-all cursor-pointer h-8 ${
                        isCompetitor
                          ? 'bg-[var(--main-color)]/15 border-[var(--main-color)]/35 text-[var(--main-color)]'
                          : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] text-slate-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-xs font-medium">Competitor Athlete</span>
                      <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${isCompetitor ? 'bg-[var(--main-color)]/30 border border-[var(--main-color)]/50' : 'bg-[var(--card-subtle-bg)] border border-[var(--card-border)]'}`}>
                        <div className={`w-3 h-3 rounded-full transition-transform ${isCompetitor ? 'translate-x-4 bg-[var(--main-color)] shadow-[0_0_8px_var(--main-color-glow)]' : 'translate-x-0 bg-slate-500'}`} />
                      </div>
                    </button>
                  </div>

                  {/* Competitor Expand Strip */}
                  {isCompetitor && (
                    <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--main-color)]/25 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[9px] text-slate-400 mb-0.5 font-medium">Show Name *</label>
                        <input
                          type="text"
                          value={targetShow}
                          onChange={(e) => {
                            setTargetShow(e.target.value);
                            if (errors.targetShow) setErrors(prev => ({ ...prev, targetShow: '' }));
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white h-7.5"
                        />
                      </div>
                      <div>
                        <SelectDropdown
                          label="Division"
                          size="sm"
                          value={division}
                          onChange={(val) => setDivision(val as CompetitorDivision)}
                          options={COMPETITOR_DIVISIONS}
                        />
                      </div>
                    </div>
                  )}

                  {/* Mobile Navigation Button to Next Substep */}
                  <div className="sm:hidden pt-2 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMobileTab('membership')}
                      className="w-full gym-btn-primary text-xs py-2 h-9"
                    >
                      Next: Membership &amp; Notes &rarr;
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-center text-[10px] text-slate-400 hover:text-white underline cursor-pointer py-1"
                    >
                      Or Quick Save with Default VIP Membership
                    </button>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* COLUMN 2: SUBSCRIPTION PLAN, MEMBERSHIP & COACH NOTES                     */}
                {/* ========================================================================= */}
                <div className={`space-y-2.5 ${mobileTab === 'membership' ? 'block' : 'hidden sm:block'}`}>
                  {/* Membership Card */}
                  <div className="p-3 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--main-color)] font-semibold">
                        Subscription &amp; Membership
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {durationMonths}m &bull; {subscriptionPrice} {coachSettings?.currency || 'EGP'}
                      </span>
                    </div>

                    {/* Package Type Template Choice Dropdown */}
                    <div>
                      <SelectDropdown
                        label="Package Type"
                        value={subscriptionPlan}
                        onChange={(val) => handleSelectPlanType(val as SubscriptionPlanType)}
                        options={SUBSCRIPTION_PLANS}
                      />
                    </div>

                    {/* Duration Pills */}
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                        Duration
                      </label>
                      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] h-8">
                        {[1, 3, 6, 12].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleSelectDuration(m)}
                            className={`flex-1 h-6 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              durationMonths === m
                                ? 'bg-[var(--main-color)]/15 border border-[var(--main-color)]/35 text-[var(--main-color)] shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 border border-transparent'
                            }`}
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dates & Fee Strip */}
                    <div className="grid grid-cols-12 gap-2 pt-0.5">
                      {/* Start Date */}
                      <div className="col-span-6">
                        <DatePicker
                          label="Start Date"
                          required
                          value={startDate}
                          onChange={(val) => handleStartDateChange(val)}
                          error={errors.startDate}
                          align="left"
                        />
                      </div>

                      {/* End Date */}
                      <div className="col-span-6">
                        <DatePicker
                          label="End Date"
                          required
                          value={endDate}
                          onChange={(val) => setEndDate(val)}
                          error={errors.endDate}
                          align="right"
                        />
                      </div>

                      {/* Fee */}
                      <div className="col-span-12">
                        <label className="block text-[9px] text-slate-400 mb-0.5 font-medium">
                          Total Membership Fee ({coachSettings?.currency || 'EGP'})
                        </label>
                        <input
                          type="number"
                          value={subscriptionPrice}
                          onChange={(e) => setSubscriptionPrice(e.target.value)}
                          placeholder="6000"
                          className="w-full px-2.5 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs font-numeric font-medium text-white focus:outline-none focus:border-[var(--main-color)] text-center h-8"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coach Notes & Medical Conditions */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                      Injuries, Medical Conditions &amp; Notes
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Mild right knee sensitivity on squats, prefers morning sessions..."
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--main-color)] transition-colors resize-none custom-scrollbar"
                    />
                  </div>

                  {/* Mobile Navigation Buttons in Membership Substep */}
                  <div className="sm:hidden pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileTab('info')}
                      className="gym-btn-secondary text-xs flex-1 h-9"
                    >
                      &larr; Back to Profile
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="gym-btn-primary text-xs flex-1 h-9"
                    >
                      Save &amp; Continue
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Desktop Locked Footer (Zero Scroll, Always Anchored) */}
            <div className="hidden sm:flex px-5 py-2.5 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="gym-btn-ghost text-xs"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gym-btn-primary text-xs inline-flex items-center"
                >
                  Save &amp; Continue
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: WORKOUT PLAN (CUSTOMIZED STUDIO EXPERIENCE, ZERO ICONS)           */}
        {/* ========================================================================= */}
        {currentStep === 'workout' && createdAthlete && (
          <div className="flex flex-col animate-in fade-in duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="gym-heading-card">
                    Step 2: Build Custom Workout Plan
                  </h2>
                  <span className="gym-delta-blue">
                    {createdAthlete.name}
                  </span>
                </div>
                <p className="gym-subtext mt-0.5">
                  Design a personalized training split and exercises for this athlete
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-medium cursor-pointer"
                title="Finish Later"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl gym-card space-y-3">
                <div>
                  <h3 className="gym-heading-card">
                    Build Routine in Splits Studio
                  </h3>
                  <p className="gym-subtext mt-1">
                    Launch Splits Studio to craft a tailored workout routine, muscle split, exercise selection, sets, reps, and rest periods specifically for {createdAthlete.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenSplitsStudio}
                  className="gym-btn-primary w-full py-2.5 px-4 text-xs font-bold text-center"
                >
                  Open Splits Studio
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={handleSkipWorkout}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Skip Workout Plan &amp; Continue to Diet
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Finish Later
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: NUTRITION & DIET (CUSTOMIZED STUDIO EXPERIENCE, ZERO ICONS)       */}
        {/* ========================================================================= */}
        {currentStep === 'diet' && createdAthlete && (
          <div className="flex flex-col animate-in fade-in duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="gym-heading-card">
                    Step 3: Build Custom Nutrition
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--main-color)]/15 border border-[var(--main-color)]/35 text-[var(--main-color)] font-bold">
                    {createdAthlete.name}
                  </span>
                </div>
                <p className="gym-subtext mt-0.5">
                  Calculate target calories, macros, and scheduled meals
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-medium cursor-pointer"
                title="Finish Setup"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--main-color)]/30 space-y-3">
                <div>
                  <h3 className="gym-heading-card">
                    Formulate Diet in Diet Studio
                  </h3>
                  <p className="gym-subtext mt-1">
                    Launch Diet Studio to calculate daily calorie targets, macros (Protein, Carbs, Fats), and scheduled meals for {createdAthlete.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenDietStudio}
                  className="gym-btn-primary w-full py-2.5 px-4 text-xs font-bold text-center"
                >
                  Open Diet Studio
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={handleCompleteSetup}
                className="gym-btn-ghost text-xs"
              >
                Skip Diet Plan
              </button>

              <button
                type="button"
                onClick={handleCompleteSetup}
                className="gym-btn-primary text-xs inline-flex items-center"
              >
                Finish Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

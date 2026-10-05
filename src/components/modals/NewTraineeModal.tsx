'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, UserGoal, CompetitorDivision, SubscriptionPlanType, ClientSubscription } from '@/types';
import { clientService } from '@/services/clientService';
import { sanitizeString, sanitizeNotes } from '@/lib/sanitizer';

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
  const { createTrainee, coachSettings } = useGym();
  const { showToast } = useToast();

  // Multi-step sequential flow
  const [currentStep, setCurrentStep] = useState<'profile' | 'workout' | 'diet'>('profile');
  const [createdAthlete, setCreatedAthlete] = useState<User | null>(null);

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

  // Reset modal state whenever opened fresh (Zero fake prefilled numbers)
  const resetForm = () => {
    setCurrentStep('profile');
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
    const curr = parseFloat(weightKg) || 75;
    if (newGoal === 'Fat Loss & Conditioning') {
      setTargetWeightKg(String(Math.max(45, curr - 6)));
    } else if (newGoal === 'Hypertrophy / Muscle Gain') {
      setTargetWeightKg(String(curr + 4));
    }
  };

  // Comprehensive validation for all required fields using Zod and Sanitizer
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

    // Competitor Show name if competitor is checked
    if (isCompetitor && !targetShow.trim()) {
      errs.targetShow = 'Required';
    }

    setErrors(errs);
    return validation.success && (!isCompetitor || Boolean(targetShow.trim()));
  };

  // STEP 1: Save athlete profile & advance to custom plan step
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1()) {
      showToast('Please complete all required fields correctly', 'error');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-xl bg-[#080c14] border border-[#141b26] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* STEP 1: ATHLETE REGISTRATION (WEBSITE THEME TOKENS, ZERO SCROLL)          */}
        {/* ========================================================================= */}
        {currentStep === 'profile' && (
          <form onSubmit={handleSaveProfile} className="flex flex-col">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#0b101b] border-b border-[#141b26] flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight leading-tight">
                  Register New Athlete
                </h2>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  Basic info &amp; biometrics &bull; Step 1 of 3
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-lg bg-[#05080e] border border-[#16202e] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-medium cursor-pointer"
                title="Close"
              >
                &times;
              </button>
            </div>

            {/* Compact Form Body - Zero Vertical Scrolling with internal scroll safeguard */}
            <div className="p-4 sm:p-5 space-y-2.5 max-h-[72vh] overflow-y-auto custom-scrollbar">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    className={`w-full px-3 py-1.5 rounded-xl bg-[#05080e] border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.name ? 'border-rose-500/70 focus:border-rose-500' : 'border-[#16202e] focus:border-cyan-500/35'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    {errors.email && (
                      <span className="text-[9px] text-rose-400 font-mono font-medium">{errors.email}</span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="athlete@domain.com"
                    className={`w-full px-3 py-1.5 rounded-xl bg-[#05080e] border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.email ? 'border-rose-500/70 focus:border-rose-500' : 'border-[#16202e] focus:border-cyan-500/35'
                    }`}
                  />
                </div>
              </div>

              {/* Row 2: Phone, Gender, Age */}
              <div className="grid grid-cols-12 gap-2.5">
                <div className="col-span-6">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Phone / WhatsApp <span className="text-rose-400">*</span>
                    </label>
                    {errors.phone && (
                      <span className="text-[9px] text-rose-400 font-mono font-medium">{errors.phone}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    placeholder="+20 101 234 5678"
                    className={`w-full px-3 py-1.5 rounded-xl bg-[#05080e] border text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.phone ? 'border-rose-500/70 focus:border-rose-500' : 'border-[#16202e] focus:border-cyan-500/35'
                    }`}
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Gender
                  </label>
                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#05080e] border border-[#16202e]">
                    <button
                      type="button"
                      onClick={() => setGender('Male')}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        gender === 'Male'
                          ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 shadow-sm shadow-cyan-950/40'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('Female')}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        gender === 'Female'
                          ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 shadow-sm shadow-cyan-950/40'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Age <span className="text-rose-400">*</span>
                    </label>
                    {errors.age && (
                      <span className="text-[9px] text-rose-400 font-mono font-medium">{errors.age}</span>
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
                    className={`w-full px-2.5 py-1.5 rounded-xl bg-[#05080e] border text-xs text-white focus:outline-none transition-colors text-center ${
                      errors.age ? 'border-rose-500/70 focus:border-rose-500' : 'border-[#16202e] focus:border-cyan-500/35'
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: Biometrics (Weight, Target Weight, Height, Body Fat %) */}
              <div className="grid grid-cols-4 gap-2.5 p-2.5 rounded-2xl bg-[#05080e] border border-[#141b26]">
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
                    className={`w-full px-2 py-1 rounded-lg bg-[#0b101b] border text-xs font-numeric font-medium text-white placeholder-slate-500 focus:outline-none text-center ${
                      errors.weightKg ? 'border-rose-500/70' : 'border-[#16202e] focus:border-cyan-500/35'
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
                    className={`w-full px-2 py-1 rounded-lg bg-[#0b101b] border text-xs font-numeric font-medium text-white placeholder-slate-500 focus:outline-none text-center ${
                      errors.targetWeightKg ? 'border-rose-500/70' : 'border-[#16202e] focus:border-cyan-500/35'
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
                    className={`w-full px-2 py-1 rounded-lg bg-[#0b101b] border text-xs font-numeric font-medium text-white placeholder-slate-500 focus:outline-none text-center ${
                      errors.heightCm ? 'border-rose-500/70' : 'border-[#16202e] focus:border-cyan-500/35'
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
                    className="w-full px-2 py-1 rounded-lg bg-[#0b101b] border border-[#16202e] text-xs font-numeric font-medium text-white focus:outline-none focus:border-cyan-500/35 text-center placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Row 4: Primary Goal + Competitor Modern Switch */}
              <div className="grid grid-cols-12 gap-2.5 items-center">
                <div className="col-span-7">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Primary Goal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => handleGoalChange(e.target.value as UserGoal)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white focus:outline-none focus:border-cyan-500/35 transition-colors"
                  >
                    {GOALS.map((g) => (
                      <option key={g} value={g} className="bg-[#080c14] text-white">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCompetitor(!isCompetitor)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isCompetitor
                        ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300'
                        : 'bg-[#05080e] border-[#16202e] text-slate-300 hover:border-[#233146]'
                    }`}
                  >
                    <span className="text-xs font-medium">Competitor</span>
                    <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${isCompetitor ? 'bg-cyan-500/30 border border-cyan-400/50' : 'bg-[#141b26] border border-[#1e293b]'}`}>
                      <div className={`w-3 h-3 rounded-full transition-transform ${isCompetitor ? 'translate-x-4 bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'translate-x-0 bg-slate-500'}`} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Competitor Expand Strip (If Checked) */}
              {isCompetitor && (
                <div className="grid grid-cols-2 gap-2.5 p-2 rounded-xl bg-[#05080e] border border-cyan-500/25">
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-0.5">Show Name *</label>
                    <input
                      type="text"
                      value={targetShow}
                      onChange={(e) => {
                        setTargetShow(e.target.value);
                        if (errors.targetShow) setErrors(prev => ({ ...prev, targetShow: '' }));
                      }}
                      className="w-full px-2 py-1 rounded-lg bg-[#0b101b] border border-[#16202e] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-0.5">Division</label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value as CompetitorDivision)}
                      className="w-full px-2 py-1 rounded-lg bg-[#0b101b] border border-[#16202e] text-xs text-white"
                    >
                      {COMPETITOR_DIVISIONS.map((d) => (
                        <option key={d} value={d} className="bg-[#080c14] text-white">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Row 5: Membership & Subscription Plan */}
              <div className="p-2.5 rounded-2xl bg-[#05080e] border border-[#141b26] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    Subscription Plan &amp; Membership
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {durationMonths} Months &bull; {subscriptionPrice} {coachSettings?.currency || 'EGP'}
                  </span>
                </div>

                {/* Plan Type Selector */}
                <div>
                  <label className="block text-[9px] text-slate-400 mb-1 font-medium">
                    Package Type
                  </label>
                  <div className="flex flex-wrap items-center gap-1">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => handleSelectPlanType(plan)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          subscriptionPlan === plan
                            ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 shadow-sm shadow-cyan-950/40'
                            : 'bg-[#0b101b] border border-[#16202e] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Pills + Dates + Price */}
                <div className="grid grid-cols-12 gap-2 pt-1">
                  {/* Duration Pills */}
                  <div className="col-span-12 sm:col-span-4">
                    <label className="block text-[9px] text-slate-400 mb-1 font-medium">
                      Duration
                    </label>
                    <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#0b101b] border border-[#16202e]">
                      {[1, 3, 6, 12].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleSelectDuration(m)}
                          className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            durationMonths === m
                              ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 border border-transparent'
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="col-span-6 sm:col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9px] text-slate-400 font-medium">
                        Start Date *
                      </label>
                      {errors.startDate && (
                        <span className="text-[8px] text-rose-400 font-mono">{errors.startDate}</span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg bg-[#0b101b] border border-[#16202e] text-xs font-mono text-white focus:outline-none focus:border-cyan-500/35 text-center"
                    />
                  </div>

                  {/* End Date */}
                  <div className="col-span-6 sm:col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[9px] text-slate-400 font-medium">
                        End Date *
                      </label>
                      {errors.endDate && (
                        <span className="text-[8px] text-rose-400 font-mono">{errors.endDate}</span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg bg-[#0b101b] border border-[#16202e] text-xs font-mono text-white focus:outline-none focus:border-cyan-500/35 text-center"
                    />
                  </div>

                  {/* Fee */}
                  <div className="col-span-12 sm:col-span-2">
                    <label className="block text-[9px] text-slate-400 mb-1 font-medium truncate">
                      Fee ({coachSettings?.currency || 'EGP'})
                    </label>
                    <input
                      type="number"
                      value={subscriptionPrice}
                      onChange={(e) => setSubscriptionPrice(e.target.value)}
                      placeholder="4500"
                      className="w-full px-2 py-1 rounded-lg bg-[#0b101b] border border-[#16202e] text-xs font-numeric font-medium text-white focus:outline-none focus:border-cyan-500/35 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Coach Notes */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                  Injuries, Medical Conditions &amp; Coach Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mild right knee sensitivity on squats, prefers morning sessions..."
                  className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/35 transition-colors"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#0b101b] border-t border-[#141b26] flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-1.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all cursor-pointer inline-flex items-center active:scale-95 shadow-sm disabled:opacity-50"
              >
                Save &amp; Continue
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: WORKOUT PLAN (CUSTOMIZED STUDIO EXPERIENCE, ZERO ICONS)           */}
        {/* ========================================================================= */}
        {currentStep === 'workout' && createdAthlete && (
          <div className="flex flex-col animate-in fade-in duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#0b101b] border-b border-[#141b26] flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-white tracking-tight">
                    Step 2: Build Custom Workout Plan
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 font-bold">
                    {createdAthlete.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Design a personalized training split and exercises for this athlete
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-lg bg-[#05080e] border border-[#16202e] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-medium cursor-pointer"
                title="Finish Later"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-2xl bg-[#0b101b] border border-cyan-500/30 space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-tight">
                    Build Routine in Splits Studio
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    Launch Splits Studio to craft a tailored workout routine, muscle split, exercise selection, sets, reps, and rest periods specifically for {createdAthlete.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenSplitsStudio}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all cursor-pointer text-center active:scale-98 shadow-sm"
                >
                  Open Splits Studio
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#0b101b] border-t border-[#141b26] flex items-center justify-between flex-shrink-0">
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
            <div className="px-5 py-3.5 bg-[#0b101b] border-b border-[#141b26] flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-white tracking-tight">
                    Step 3: Build Custom Nutrition
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 font-bold">
                    {createdAthlete.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Calculate target calories, macros, and scheduled meals
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-lg bg-[#05080e] border border-[#16202e] text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-medium cursor-pointer"
                title="Finish Setup"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-2xl bg-[#0b101b] border border-cyan-500/30 space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-tight">
                    Formulate Diet in Diet Studio
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    Launch Diet Studio to calculate daily calorie targets, macros (Protein, Carbs, Fats), and scheduled meals for {createdAthlete.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenDietStudio}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all cursor-pointer text-center active:scale-98 shadow-sm"
                >
                  Open Diet Studio
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#0b101b] border-t border-[#141b26] flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={handleCompleteSetup}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Skip Diet Plan
              </button>

              <button
                type="button"
                onClick={handleCompleteSetup}
                className="py-1.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all cursor-pointer inline-flex items-center active:scale-95 shadow-sm"
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

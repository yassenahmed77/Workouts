'use client';
import React from 'react';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { DatePicker } from '@/components/ui/DatePicker';
import { clientService } from '@/services/clientService';
import { useToast } from '@/context/ToastContext';

const GOALS = [
    'Hypertrophy / Muscle Gain',
    'Strength & Power',
    'Fat Loss & Conditioning',
    'Athletic Performance',
    'Rehabilitation & Mobility'
];

const COMPETITOR_DIVISIONS = [
    'Classic Physique',
    "Men's Physique",
    'Open Bodybuilding',
    'Bikini Pro',
    'Figure'
];

const SUBSCRIPTION_PLANS = [
    'Full VIP Coaching',
    'Workout Only',
    'Nutrition Only',
    'Contest Prep',
    'Custom Coaching'
];

/**
 * TraineeProfileStep - نموذج تسجيل بيانات المتدرب والاشتراك (الخطوة 1)
 */
export function TraineeProfileStep({ wizard, onNavigateToClient360, onSuccessSelect }) {
    const { showToast } = useToast();
    const {
        mobileTab,
        setMobileTab,
        isSecondaryAccountAllowed,
        setIsSecondaryAccountAllowed,
        name,
        setName,
        email,
        setEmail,
        phone,
        setPhone,
        gender,
        setGender,
        age,
        setAge,
        weightKg,
        setWeightKg,
        targetWeightKg,
        setTargetWeightKg,
        heightCm,
        setHeightCm,
        bodyFatPercentage,
        setBodyFatPercentage,
        goal,
        notes,
        setNotes,
        isCompetitor,
        setIsCompetitor,
        division,
        setDivision,
        targetShow,
        setTargetShow,
        subscriptionPlan,
        durationMonths,
        startDate,
        endDate,
        setEndDate,
        subscriptionPrice,
        setSubscriptionPrice,
        errors,
        setErrors,
        isSubmitting,
        existingAthlete,
        goalWeightValidation,
        coachSettings,
        handleClose,
        handleGoalChange,
        handleSelectPlanType,
        handleSelectDuration,
        handleStartDateChange,
        handleSaveProfile
    } = wizard;

    return (
        <form onSubmit={handleSaveProfile} className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="gym-heading-page text-sm sm:text-base">Register New Athlete</h2>
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

            {/* Mobile Substep Segmented Navigation */}
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

            {/* Form Body */}
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
                                    setErrors((prev) => ({ ...prev, duplicate: '' }));
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
                    {/* COLUMN 1: ATHLETE IDENTITY, BIOMETRICS & GOAL */}
                    <div className={`space-y-2.5 ${mobileTab === 'info' ? 'block' : 'hidden sm:block'}`}>
                        {/* Full Name */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                                    Full Name <span className="text-rose-400">*</span>
                                </label>
                                {errors.name && <span className="text-[9px] text-rose-400 font-mono font-medium">{errors.name}</span>}
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
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
                                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate block mb-1">
                                    Phone / WhatsApp <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value);
                                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                                    }}
                                    placeholder="+20 101 234 5678"
                                    className={`w-full px-2.5 py-1.5 rounded-xl bg-[var(--input-bg)] border text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-colors h-8 ${
                                        errors.phone ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate block mb-1">
                                    Email Address <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                                    }}
                                    placeholder="athlete@domain.com"
                                    className={`w-full px-2.5 py-1.5 rounded-xl bg-[var(--input-bg)] border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors h-8 ${
                                        errors.email ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Gender & Age */}
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
                                    {errors.age && <span className="text-[9px] text-rose-400 font-mono">{errors.age}</span>}
                                </div>
                                <input
                                    type="number"
                                    min="12"
                                    max="100"
                                    value={age}
                                    onChange={(e) => {
                                        setAge(e.target.value);
                                        if (errors.age) setErrors((prev) => ({ ...prev, age: '' }));
                                    }}
                                    placeholder="24"
                                    className={`w-full px-2.5 py-1.5 rounded-xl bg-[var(--input-bg)] border text-xs text-white focus:outline-none transition-colors text-center h-8 font-mono ${
                                        errors.age ? 'border-rose-500/70 focus:border-rose-500' : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Biometrics Card */}
                        <div className="p-2.5 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                                    Biometrics &amp; Weight
                                </span>
                                {weightKg && targetWeightKg && !isNaN(parseFloat(weightKg)) && !isNaN(parseFloat(targetWeightKg)) && (
                                    <span
                                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                            !goalWeightValidation.isValid
                                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                                : goalWeightValidation.trend === 'loss'
                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                : goalWeightValidation.trend === 'gain'
                                                ? 'bg-[var(--main-color)]/15 text-[var(--main-color)] border border-[var(--main-color)]/30'
                                                : 'bg-white/[0.06] text-slate-400 border border-white/[0.08]'
                                        }`}
                                    >
                                        {goalWeightValidation.deltaKg > 0 ? `+${goalWeightValidation.deltaKg}` : goalWeightValidation.deltaKg} kg (
                                        {goalWeightValidation.trend === 'loss' ? 'Loss' : goalWeightValidation.trend === 'gain' ? 'Gain' : 'Maintain'})
                                    </span>
                                )}
                            </div>

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
                                            if (errors.weightKg) setErrors((prev) => ({ ...prev, weightKg: '' }));
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
                                            if (errors.targetWeightKg) setErrors((prev) => ({ ...prev, targetWeightKg: '' }));
                                        }}
                                        placeholder="78"
                                        className={`w-full px-2 py-1 rounded-lg bg-[var(--input-bg)] border text-xs font-numeric font-medium text-white placeholder-slate-500 focus:outline-none text-center h-7.5 ${
                                            errors.targetWeightKg || !goalWeightValidation.isValid
                                                ? 'border-rose-500/70 focus:border-rose-500'
                                                : 'border-[var(--input-border)] focus:border-[var(--main-color)]'
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
                                            if (errors.heightCm) setErrors((prev) => ({ ...prev, heightCm: '' }));
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

                            {!goalWeightValidation.isValid && goalWeightValidation.error && (
                                <p className="text-[9px] text-rose-400 font-mono mt-1 font-medium">
                                    &bull; {goalWeightValidation.error}
                                </p>
                            )}
                        </div>

                        {/* Primary Goal */}
                        <div>
                            <SelectDropdown
                                label="Primary Goal"
                                required
                                value={goal}
                                onChange={(val) => handleGoalChange(val)}
                                options={GOALS}
                            />
                        </div>

                        {/* Competitor Switch */}
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
                                <div
                                    className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                                        isCompetitor
                                            ? 'bg-[var(--main-color)]/30 border border-[var(--main-color)]/50'
                                            : 'bg-[var(--card-subtle-bg)] border border-[var(--card-border)]'
                                    }`}
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full transition-transform ${
                                            isCompetitor
                                                ? 'translate-x-4 bg-[var(--main-color)] shadow-[0_0_8px_var(--main-color-glow)]'
                                                : 'translate-x-0 bg-slate-500'
                                        }`}
                                    />
                                </div>
                            </button>
                        </div>

                        {isCompetitor && (
                            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--main-color)]/25 animate-in fade-in duration-150">
                                <div>
                                    <label className="block text-[9px] text-slate-400 mb-0.5 font-medium">Show Name *</label>
                                    <input
                                        type="text"
                                        value={targetShow}
                                        onChange={(e) => {
                                            setTargetShow(e.target.value);
                                            if (errors.targetShow) setErrors((prev) => ({ ...prev, targetShow: '' }));
                                        }}
                                        className="w-full px-2 py-1 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white h-7.5"
                                    />
                                </div>
                                <div>
                                    <SelectDropdown
                                        label="Division"
                                        size="sm"
                                        value={division}
                                        onChange={(val) => setDivision(val)}
                                        options={COMPETITOR_DIVISIONS}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Mobile Navigation */}
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

                    {/* COLUMN 2: SUBSCRIPTION PLAN & NOTES */}
                    <div className={`space-y-2.5 ${mobileTab === 'membership' ? 'block' : 'hidden sm:block'}`}>
                        <div className="p-3 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--main-color)] font-semibold">
                                    Subscription &amp; Membership
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                    {durationMonths}m &bull; {subscriptionPrice} {coachSettings?.currency || 'EGP'}
                                </span>
                            </div>

                            <div>
                                <SelectDropdown
                                    label="Package Type"
                                    value={subscriptionPlan}
                                    onChange={(val) => handleSelectPlanType(val)}
                                    options={SUBSCRIPTION_PLANS}
                                />
                            </div>

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

                            <div className="grid grid-cols-12 gap-2 pt-0.5">
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

            {/* Desktop Locked Footer */}
            <div className="hidden sm:flex px-5 py-2.5 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] items-center justify-between flex-shrink-0">
                <button type="button" onClick={handleClose} className="gym-btn-ghost text-xs">
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
    );
}

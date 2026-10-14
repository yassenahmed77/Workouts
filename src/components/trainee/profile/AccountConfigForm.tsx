'use client';

import React from 'react';
import { UserGoal } from '@/types';

const GOALS: UserGoal[] = [
  'Hypertrophy / Muscle Gain',
  'Strength & Power',
  'Fat Loss & Conditioning',
  'Athletic Performance',
  'Rehabilitation & Mobility'
];

interface AccountConfigFormProps {
  name: string;
  onNameChange: (val: string) => void;
  email: string;
  phone: string;
  onPhoneChange: (val: string) => void;
  weightKg: number | string;
  onWeightKgChange: (val: number) => void;
  targetWeightKg: number | string;
  onTargetWeightKgChange: (val: number) => void;
  heightCm: number | string;
  onHeightCmChange: (val: number) => void;
  age: string;
  onAgeChange: (val: string) => void;
  gender: 'Male' | 'Female';
  onGenderChange: (val: 'Male' | 'Female') => void;
  bodyFat: string;
  onBodyFatChange: (val: string) => void;
  avatarUrl: string;
  onAvatarUrlChange: (val: string) => void;
  goal: UserGoal;
  onGoalChange: (val: UserGoal) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AccountConfigForm: React.FC<AccountConfigFormProps> = React.memo(({
  name,
  onNameChange,
  email,
  phone,
  onPhoneChange,
  weightKg,
  onWeightKgChange,
  targetWeightKg,
  onTargetWeightKgChange,
  heightCm,
  onHeightCmChange,
  age,
  onAgeChange,
  gender,
  onGenderChange,
  bodyFat,
  onBodyFatChange,
  avatarUrl,
  onAvatarUrlChange,
  goal,
  onGoalChange,
  notes,
  onNotesChange,
  isSaving,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="gym-card space-y-3">
      {/* Centered Header */}
      <div className="pb-2 border-b border-[var(--card-border)] text-center">
        <span className="gym-label-mono block text-[var(--main-color)]">ACCOUNT CONFIG</span>
        <h3 className="gym-heading-card mt-0.5">
          Athlete Profile Directives
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Row 1: Personal Identification */}
        <div>
          <label className="gym-label-mono block mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="gym-input w-full"
          />
        </div>

        {/* Email Address is Locked (Cannot be edited) */}
        <div>
          <label className="gym-label-mono block mb-1">Email Address</label>
          <div className="gym-input w-full flex items-center justify-between text-zinc-400 bg-[var(--card-subtle-bg)] border-[var(--card-border)] cursor-not-allowed select-none">
            <span className="truncate text-xs">{email}</span>
            <span className="text-[9px] font-mono text-zinc-600 uppercase">LOCKED</span>
          </div>
        </div>

        <div>
          <label className="gym-label-mono block mb-1">WhatsApp / Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+20 1..."
            className="gym-input w-full"
          />
        </div>

        {/* Row 2: Biometrics & Body Targets */}
        <div>
          <label className="gym-label-mono block mb-1">Current Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            required
            value={weightKg}
            onChange={(e) => onWeightKgChange(parseFloat(e.target.value) || 0)}
            className="gym-input w-full font-mono text-white font-bold"
          />
        </div>

        <div>
          <label className="gym-label-mono block mb-1">Target Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            required
            value={targetWeightKg}
            onChange={(e) => onTargetWeightKgChange(parseFloat(e.target.value) || 0)}
            className="gym-input w-full font-mono text-[var(--main-color)] font-bold"
          />
        </div>

        <div>
          <label className="gym-label-mono block mb-1">Height (cm)</label>
          <input
            type="number"
            required
            value={heightCm}
            onChange={(e) => onHeightCmChange(parseInt(e.target.value) || 0)}
            className="gym-input w-full font-mono"
          />
        </div>

        {/* Row 3: Demographics & Composition */}
        <div>
          <label className="gym-label-mono block mb-1">Age</label>
          <input
            type="number"
            min="12"
            max="100"
            placeholder="e.g. 24"
            value={age}
            onChange={(e) => onAgeChange(e.target.value)}
            className="gym-input w-full font-mono"
          />
        </div>

        <div>
          <label className="gym-label-mono block mb-1">Gender</label>
          <select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value as 'Male' | 'Female')}
            className="gym-input w-full text-xs"
          >
            <option value="Male" className="bg-[var(--card-bg)] text-white">Male</option>
            <option value="Female" className="bg-[var(--card-bg)] text-white">Female</option>
          </select>
        </div>

        <div>
          <label className="gym-label-mono block mb-1">Body Fat (% est.)</label>
          <input
            type="number"
            step="0.5"
            placeholder="e.g. 15.0"
            value={bodyFat}
            onChange={(e) => onBodyFatChange(e.target.value)}
            className="gym-input w-full font-mono"
          />
        </div>

        {/* Row 4: Goal & Avatar */}
        <div className="sm:col-span-2">
          <label className="gym-label-mono block mb-1">Training Focus / Primary Goal</label>
          <select
            value={goal}
            onChange={(e) => onGoalChange(e.target.value as UserGoal)}
            className="gym-input w-full text-xs"
          >
            {GOALS.map((g) => (
              <option key={g} value={g} className="bg-[var(--card-bg)] text-white">
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="gym-label-mono block mb-1">Avatar Image URL</label>
          <input
            type="url"
            placeholder="https://images.unsplash..."
            value={avatarUrl}
            onChange={(e) => onAvatarUrlChange(e.target.value)}
            className="gym-input w-full text-xs font-mono"
          />
        </div>
      </div>

      <div>
        <label className="gym-label-mono block mb-1">
          Physical Restrictions, Directives &amp; Warmup Guidelines
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="e.g. Shoulder warmup before heavy pressing, avoid behind-the-neck work..."
          className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--main-color)] resize-none leading-relaxed"
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSaving}
          className="gym-btn-primary text-xs cursor-pointer"
        >
          {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  );
});

AccountConfigForm.displayName = 'AccountConfigForm';

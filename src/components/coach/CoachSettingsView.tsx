'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { CoachSettings, CoachPackage } from '@/types';
import { coachSettingsService } from '@/services/coachSettingsService';

const CURRENCY_OPTIONS = ['EGP', 'USD', 'SAR', 'AED', 'EUR', 'GBP'];
const REMINDER_DAYS_OPTIONS = [1, 3, 5, 7, 14];
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CoachSettingsView: React.FC = () => {
  const { coachSettings, updateCoachSettings } = useGym();
  const { showToast } = useToast();

  // Local editable form state
  const [coachName, setCoachName] = useState(coachSettings.coachName);
  const [brandName, setBrandName] = useState(coachSettings.brandName);
  const [tagline, setTagline] = useState(coachSettings.tagline);
  const [whatsappNumber, setWhatsappNumber] = useState(coachSettings.whatsappNumber);
  const [email, setEmail] = useState(coachSettings.email);
  const [currency, setCurrency] = useState(coachSettings.currency || 'EGP');
  const [renewalReminderDaysBefore, setRenewalReminderDaysBefore] = useState(
    coachSettings.renewalReminderDaysBefore || 3
  );
  const [checkInDays, setCheckInDays] = useState<string[]>(
    coachSettings.checkInDays || ['Friday', 'Sunday']
  );
  const [packages, setPackages] = useState<CoachPackage[]>(coachSettings.packages || []);

  // WhatsApp Custom Template
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>(
    'Hi {clientName}, this is {coachName} from {brandName}. Your {planName} membership is ending on {endDate} ({daysLeft} days remaining). Would you like to renew for the upcoming cycle to keep your progression on track? Let me know!'
  );

  // New / Editing Package Modal State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgDuration, setPkgDuration] = useState('3');
  const [pkgPrice, setPkgPrice] = useState('6000');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgIsPopular, setPkgIsPopular] = useState(false);

  // Sync state if context changes externally
  useEffect(() => {
    if (coachSettings) {
      setCoachName(coachSettings.coachName);
      setBrandName(coachSettings.brandName);
      setTagline(coachSettings.tagline);
      setWhatsappNumber(coachSettings.whatsappNumber);
      setEmail(coachSettings.email);
      setCurrency(coachSettings.currency || 'EGP');
      setRenewalReminderDaysBefore(coachSettings.renewalReminderDaysBefore || 3);
      setCheckInDays(coachSettings.checkInDays || ['Friday', 'Sunday']);
      setPackages(coachSettings.packages || []);
    }
  }, [coachSettings]);

  // Modal Resilience Standard (Rule 6.3): Escape key dismissal for package modal
  useEffect(() => {
    if (!isPackageModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPackageModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPackageModalOpen]);

  // Check-In Day Toggle
  const toggleCheckInDay = (day: string) => {
    setCheckInDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  // Open Package Modal
  const handleOpenAddPackage = () => {
    setEditingPackageId(null);
    setPkgName('Full VIP Coaching');
    setPkgDuration('3');
    setPkgPrice('6000');
    setPkgDescription('Custom training split, hyper-personalized nutrition, weekly check-in audits & 24/7 WhatsApp support.');
    setPkgIsPopular(false);
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: CoachPackage) => {
    setEditingPackageId(pkg.id);
    setPkgName(pkg.name);
    setPkgDuration(String(pkg.durationMonths));
    setPkgPrice(String(pkg.price));
    setPkgDescription(pkg.description);
    setPkgIsPopular(Boolean(pkg.isPopular));
    setIsPackageModalOpen(true);
  };

  const handleDeletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    showToast('Package removed', 'info');
  };

  const handleSavePackageModal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(pkgPrice) || 0;
    const parsedDuration = parseInt(pkgDuration, 10) || 1;

    const validation = coachSettingsService.validatePackage({
      id: editingPackageId || `pkg-${Date.now()}`,
      name: pkgName.trim(),
      durationMonths: parsedDuration,
      price: parsedPrice,
      description: pkgDescription.trim(),
      isPopular: pkgIsPopular
    });

    if (!validation.success || !validation.data) {
      showToast(validation.error || 'Invalid package configuration', 'error');
      return;
    }

    const validatedPackage = validation.data;

    if (editingPackageId) {
      setPackages((prev) =>
        prev.map((p) => (p.id === editingPackageId ? validatedPackage : p))
      );
      showToast('Package updated', 'success');
    } else {
      setPackages((prev) => [...prev, validatedPackage]);
      showToast('Package added', 'success');
    }
    setIsPackageModalOpen(false);
  };

  // Save All Global Settings
  const handleSaveAllSettings = async () => {
    const updated: CoachSettings = {
      coachName: coachName.trim(),
      brandName: brandName.trim(),
      tagline: tagline.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: email.trim(),
      currency,
      renewalReminderDaysBefore,
      checkInDays,
      packages
    };

    const validation = coachSettingsService.validateSettings(updated);
    if (!validation.success || !validation.data) {
      showToast(validation.error || 'Please correct errors in settings', 'error');
      return;
    }

    try {
      await updateCoachSettings(validation.data);
      showToast('White-Label Coach OS settings saved', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 select-none overflow-hidden">
      {/* 1. Header & Primary Save Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Coach OS &bull; White-Label Settings
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/25 text-cyan-300">
              Commercial Edition
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure coach brand identity, commercial pricing packages, currency, and client operation rules.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAllSettings}
          className="py-2 px-6 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          Save All Changes
        </button>
      </div>

      {/* 2. Main Two-Column Scrollable Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        
        {/* Left Column: Brand Identity & Operations (Col span 6) */}
        <div className="lg:col-span-6 space-y-3.5">
          
          {/* Card 1: Brand & Coach Identity */}
          <div className="p-4 rounded-2xl bg-[#080c14] border border-[#141b26] space-y-3 shadow-md">
            <div className="border-b border-[#141b26] pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                Brand &bull; Identity
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
                Coach &amp; Academy Profile
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Coach Name & Brand Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Coach Name
                  </label>
                  <input
                    type="text"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    placeholder="e.g. Captain Yassen Ahmed"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/35 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Academy / Brand Title
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. IRON FORGE ELITE"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/35 transition-colors"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                  Tagline / Positioning Subtitle
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Championship Bodybuilding &amp; High-Performance Systems"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/35 transition-colors"
                />
              </div>

              {/* WhatsApp & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Official WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+201023456789"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/35 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coach@fitness.io"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/35 transition-colors"
                  />
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Primary Operating Currency
                </label>
                <div className="flex flex-wrap items-center gap-1 p-0.5 rounded-xl bg-[#05080e] border border-[#16202e]">
                  {CURRENCY_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`flex-1 min-w-[50px] py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currency === c
                          ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Operations & Check-in Rules */}
          <div className="p-4 rounded-2xl bg-[#080c14] border border-[#141b26] space-y-3 shadow-md">
            <div className="border-b border-[#141b26] pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                Operations &bull; Automation Rules
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
                Check-Ins &amp; Renewal Reminders
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Renewal Lead Time */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Renewal Reminder Lead Time (Days Before Expiry)
                </label>
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#05080e] border border-[#16202e]">
                  {REMINDER_DAYS_OPTIONS.map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRenewalReminderDaysBefore(days)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        renewalReminderDaysBefore === days
                          ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Check-In Days */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Scheduled Check-In Days of Week
                </label>
                <div className="flex flex-wrap gap-1">
                  {WEEK_DAYS.map((day) => {
                    const isSelected = checkInDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleCheckInDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300 shadow-sm'
                            : 'bg-[#05080e] border-[#16202e] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Automated WhatsApp Message Template */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                  WhatsApp Renewal Notice Template
                </label>
                <textarea
                  rows={3}
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/35 transition-colors leading-relaxed font-sans resize-none"
                />
                <span className="text-[10px] text-slate-500 font-mono block mt-1">
                  Variables available: {'{clientName}'}, {'{planName}'}, {'{endDate}'}, {'{daysLeft}'}, {'{coachName}'}, {'{brandName}'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Coaching Packages & Pricing Builder (Col span 6) */}
        <div className="lg:col-span-6 space-y-3.5">
          
          <div className="p-4 rounded-2xl bg-[#080c14] border border-[#141b26] space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-[#141b26] pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                  Commercialization &bull; Packages
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
                  Coaching Packages &amp; Pricing
                </h3>
              </div>

              <button
                type="button"
                onClick={handleOpenAddPackage}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                Add Package
              </button>
            </div>

            {/* Packages List */}
            <div className="space-y-2.5">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-3 rounded-xl bg-[#05080e] border border-[#141b26] hover:border-[#233146] transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                          {pkg.name}
                        </h4>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#0b101b] border border-[#16202e] text-slate-300">
                          {pkg.durationMonths}m
                        </span>
                        {pkg.isPopular && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-1">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-sm sm:text-base font-bold text-emerald-400 font-numeric tracking-tight block">
                        {pkg.price.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{currency}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPackage(pkg)}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {packages.length === 0 && (
                <div className="p-6 text-center rounded-xl bg-[#05080e] border border-[#141b26] text-slate-400 text-xs font-mono">
                  No custom coaching packages configured. Click Add Package to create offerings.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Package Create / Edit Modal */}
      {isPackageModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPackageModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-md bg-[#080c14] border border-[#141b26] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSavePackageModal} className="flex flex-col">
              {/* Header */}
              <div className="px-5 py-3.5 bg-[#0b101b] border-b border-[#141b26] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {editingPackageId ? 'Edit Coaching Package' : 'Create Coaching Package'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Define client pricing, duration, and inclusions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-[#05080e] border border-[#16202e] text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Form Body */}
              <div className="p-4 sm:p-5 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    placeholder="e.g. Full VIP Coaching"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white focus:outline-none focus:border-cyan-500/35"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                      Duration (Months)
                    </label>
                    <select
                      value={pkgDuration}
                      onChange={(e) => setPkgDuration(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white focus:outline-none focus:border-cyan-500/35"
                    >
                      <option value="1" className="bg-[#080c14] text-white">1 Month</option>
                      <option value="3" className="bg-[#080c14] text-white">3 Months</option>
                      <option value="6" className="bg-[#080c14] text-white">6 Months</option>
                      <option value="12" className="bg-[#080c14] text-white">12 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                      Price ({currency})
                    </label>
                    <input
                      type="number"
                      value={pkgPrice}
                      onChange={(e) => setPkgPrice(e.target.value)}
                      placeholder="6000"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs font-numeric text-white focus:outline-none focus:border-cyan-500/35 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Description &bull; Key Inclusions
                  </label>
                  <textarea
                    rows={3}
                    value={pkgDescription}
                    onChange={(e) => setPkgDescription(e.target.value)}
                    placeholder="Custom workout split, periodized hypertrophy program, nutrition audit &amp; weekly check-ins..."
                    className="w-full p-2.5 rounded-xl bg-[#05080e] border border-[#16202e] text-xs text-white focus:outline-none focus:border-cyan-500/35 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={pkgIsPopular}
                      onChange={(e) => setPkgIsPopular(e.target.checked)}
                      className="rounded border-[#16202e] bg-[#05080e] text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 font-medium">Highlight as Most Popular Package</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-[#0b101b] border-t border-[#141b26] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

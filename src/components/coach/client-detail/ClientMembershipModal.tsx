'use client';

import React, { useState, useEffect } from 'react';
import { User, SubscriptionPlanType, ClientSubscription } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { ClientSubscriptionSchema } from '@/schemas/client.schema';
import { sanitizeNotes } from '@/lib/sanitizer';
import { X, Calendar, CreditCard, RefreshCw, Check, Sparkles, AlertCircle } from 'lucide-react';

const SUBSCRIPTION_PLANS: SubscriptionPlanType[] = [
  'Full VIP Coaching',
  'Workout Only',
  'Nutrition Only',
  'Contest Prep',
  'Custom Coaching',
];

const DURATION_PRESETS = [1, 3, 6, 12];
const CURRENCIES = ['EGP', 'USD', 'SAR', 'AED'];

interface ClientMembershipModalProps {
  client: User;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientMembershipModal: React.FC<ClientMembershipModalProps> = ({
  client: propClient,
  isOpen,
  onClose,
}) => {
  const { updateUserSubscription, coachSettings, users } = useGym();
  const client = users.find((u) => u.id === propClient.id) || propClient;
  const { showToast } = useToast();

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
    if (plan === 'Full VIP Coaching') {
      return String(months === 1 ? 2500 : months === 3 ? 6000 : months === 6 ? 10500 : 18000);
    }
    if (plan === 'Workout Only') return String(months * 1200);
    if (plan === 'Nutrition Only') return String(months * 1000);
    if (plan === 'Contest Prep') return String(months * 2200);
    return String(months * 1500);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const [planType, setPlanType] = useState<SubscriptionPlanType>(
    client.subscription?.planType || 'Full VIP Coaching'
  );
  const [durationMonths, setDurationMonths] = useState<number>(
    client.subscription?.durationMonths || 3
  );
  const [startDate, setStartDate] = useState<string>(
    client.subscription?.startDate || todayStr
  );
  const [endDate, setEndDate] = useState<string>(
    client.subscription?.endDate || calculateEndDate(todayStr, 3)
  );
  const [price, setPrice] = useState<string>(
    client.subscription?.price !== undefined
      ? String(client.subscription.price)
      : findPackagePrice('Full VIP Coaching', 3)
  );
  const [currency, setCurrency] = useState<string>(
    client.subscription?.currency || coachSettings?.currency || 'EGP'
  );
  const [status, setStatus] = useState<'active' | 'expiring_soon' | 'expired'>(
    client.subscription?.status || 'active'
  );
  const [notes, setNotes] = useState<string>(client.subscription?.notes || '');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync state whenever client or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setErrorBanner(null);
      if (client.subscription) {
        setPlanType(client.subscription.planType);
        setDurationMonths(client.subscription.durationMonths);
        setStartDate(client.subscription.startDate);
        setEndDate(client.subscription.endDate);
        setPrice(
          client.subscription.price !== undefined
            ? String(client.subscription.price)
            : findPackagePrice(client.subscription.planType, client.subscription.durationMonths)
        );
        setCurrency(client.subscription.currency || coachSettings?.currency || 'EGP');
        setStatus(client.subscription.status);
        setNotes(client.subscription.notes || '');
      } else {
        setPlanType('Full VIP Coaching');
        setDurationMonths(3);
        setStartDate(todayStr);
        setEndDate(calculateEndDate(todayStr, 3));
        setPrice(findPackagePrice('Full VIP Coaching', 3));
        setCurrency(coachSettings?.currency || 'EGP');
        setStatus('active');
        setNotes('');
      }
    }
  }, [isOpen, client.subscription, coachSettings?.currency]);

  if (!isOpen) return null;

  const handlePlanChange = (newPlan: SubscriptionPlanType) => {
    setPlanType(newPlan);
    setPrice(findPackagePrice(newPlan, durationMonths));
  };

  const handleDurationChange = (months: number) => {
    setDurationMonths(months);
    setEndDate(calculateEndDate(startDate, months));
    setPrice(findPackagePrice(planType, months));
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setEndDate(calculateEndDate(newStart, durationMonths));
  };

  // Quick Action: Renew from Today or Extend from current End Date
  const handleQuickExtend = (additionalMonths: number) => {
    // If expired, start from today. If active, extend from current end date.
    const isCurrentExpired = new Date(endDate).getTime() < new Date().getTime();
    const effectiveStart = isCurrentExpired ? todayStr : startDate;
    const newTotalMonths = isCurrentExpired ? additionalMonths : durationMonths + additionalMonths;
    const newEnd = calculateEndDate(isCurrentExpired ? todayStr : endDate, additionalMonths);

    setStartDate(effectiveStart);
    setDurationMonths(newTotalMonths);
    setEndDate(newEnd);
    setStatus('active');
    setPrice(findPackagePrice(planType, newTotalMonths));
    showToast(`Extended by ${additionalMonths} month(s)`, 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setIsSubmitting(true);

    try {
      const parsedPrice = price.trim() !== '' ? parseFloat(price) : undefined;
      const sanitizedNoteText = sanitizeNotes(notes);

      const candidate: ClientSubscription = {
        planType,
        durationMonths,
        startDate,
        endDate,
        price: parsedPrice !== undefined && !isNaN(parsedPrice) ? parsedPrice : undefined,
        currency,
        status,
        notes: sanitizedNoteText || undefined,
      };

      const result = ClientSubscriptionSchema.safeParse(candidate);
      if (!result.success) {
        const errorMsg = result.error.issues.map((i) => i.message).join(' • ');
        setErrorBanner(errorMsg);
        setIsSubmitting(false);
        return;
      }

      await updateUserSubscription(client.id, result.data);
      showToast(`Membership updated for ${client.name}`, 'success');
      onClose();
    } catch (err) {
      setErrorBanner('Failed to update membership. Please check all values.');
      showToast('Failed to update membership', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0b0f17] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0d1420] via-[#101826] to-[#0d1420] border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Manage Membership
            </h3>
            <p className="text-[11px] font-mono text-cyan-300/90 font-medium">
              {client.name} &bull; Athlete Subscription Hub
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-4 space-y-3.5 flex-1">
          {/* Error Banner */}
          {errorBanner && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-rose-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Quick Extend Presets Banner */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/[0.08] via-emerald-500/[0.05] to-transparent border border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="font-semibold text-[11px]">Quick Extend:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickExtend(1)}
                className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-[11px] font-mono font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                +1 Month
              </button>
              <button
                type="button"
                onClick={() => handleQuickExtend(3)}
                className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-[11px] font-mono font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                +3 Months
              </button>
              <button
                type="button"
                onClick={() => handleQuickExtend(6)}
                className="px-2 py-0.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-[11px] font-mono font-medium text-cyan-300 transition-colors cursor-pointer"
              >
                +6 Months
              </button>
            </div>
          </div>

          {/* 1. Subscription Plan Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Coaching Package Plan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = planType === plan;
                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => handlePlanChange(plan)}
                    className={`py-1.5 px-2 rounded-lg text-left text-xs font-medium border transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 font-semibold shadow-sm'
                        : 'bg-[#05080e] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/10'
                    }`}
                  >
                    {plan}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Duration Preset Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Duration (Months)
              </label>
              <span className="text-[10px] font-mono text-cyan-400/90 font-medium">
                {durationMonths} Month{durationMonths > 1 ? 's' : ''} Selected
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {DURATION_PRESETS.map((m) => {
                const isSelected = durationMonths === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleDurationChange(m)}
                    className={`py-1.5 rounded-lg text-center text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#080c14] border-white shadow-sm'
                        : 'bg-[#05080e] border-white/[0.06] text-slate-300 hover:text-white hover:border-white/10'
                    }`}
                  >
                    {m} Month{m > 1 ? 's' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Dates: Start & End */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#05080e] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                End Date (Expires)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#05080e] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          {/* 4. Price, Currency & Status */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1 col-span-1">
              <label className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Price
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="6000"
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#05080e] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#05080e] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/40 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0b0f17] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 col-span-1">
              <label className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full py-1.5 px-2 rounded-lg bg-[#05080e] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/40 cursor-pointer capitalize"
              >
                <option value="active" className="bg-[#0b0f17] text-emerald-400">
                  Active
                </option>
                <option value="expiring_soon" className="bg-[#0b0f17] text-amber-400">
                  Expiring Soon
                </option>
                <option value="expired" className="bg-[#0b0f17] text-rose-400">
                  Expired
                </option>
              </select>
            </div>
          </div>

          {/* 5. Notes / Payment directives */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Payment &amp; Renewal Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash at gym / InstaPay transaction..."
              className="w-full py-1.5 px-2.5 rounded-lg bg-[#05080e] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          {/* Actions Bar */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
            >
              <span>{isSubmitting ? 'Saving...' : 'Save Membership'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

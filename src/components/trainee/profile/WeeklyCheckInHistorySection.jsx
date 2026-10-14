'use client';
import React from 'react';
export const WeeklyCheckInHistorySection = React.memo(({ totalNetDeltaKg, date, onDateChange, weight, onWeightChange, waistCm, onWaistCmChange, chestCm, onChestCmChange, onSubmit, weightLogs, onDeleteWeight }) => {
    return (<div className="gym-card space-y-3">
      {/* Centered Header */}
      <div className="pb-2 border-b border-[var(--card-border)] text-center space-y-1">
        <span className="gym-label-mono block text-[var(--main-color)]">BODY BIOMETRICS</span>
        <h3 className="gym-heading-card">
          Weekly Weigh-In &amp; Circumferences
        </h3>
        <div className="flex justify-center pt-0.5">
          <span className="gym-delta-neutral">
            {totalNetDeltaKg > 0 ? `+${totalNetDeltaKg}kg` : `${totalNetDeltaKg}kg`} Total
          </span>
        </div>
      </div>

      {/* Check-In Entry Form */}
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div>
            <label className="gym-label-mono block mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="gym-input w-full font-mono text-xs"/>
          </div>
          <div>
            <label className="gym-label-mono block mb-1">Weight (kg)</label>
            <input type="number" step="0.1" placeholder="70.0" value={weight} onChange={(e) => onWeightChange(e.target.value)} className="gym-input w-full font-mono text-xs text-[var(--main-color)] font-bold"/>
          </div>
          <div>
            <label className="gym-label-mono block mb-1">Waist (cm)</label>
            <input type="number" step="0.5" placeholder="Opt." value={waistCm} onChange={(e) => onWaistCmChange(e.target.value)} className="gym-input w-full font-mono text-xs"/>
          </div>
          <div>
            <label className="gym-label-mono block mb-1">Chest (cm)</label>
            <input type="number" step="0.5" placeholder="Opt." value={chestCm} onChange={(e) => onChestCmChange(e.target.value)} className="gym-input w-full font-mono text-xs"/>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-end">
            <button type="submit" className="gym-btn-primary w-full text-xs">
              Log Check-In
            </button>
          </div>
        </div>
      </form>

      {/* Weigh-in History List */}
      {weightLogs.length > 0 && (<div className="pt-1 space-y-1">
          <span className="gym-label-mono block text-zinc-500 text-center">
            LOGGED WEIGH-INS ({weightLogs.length})
          </span>
          <div className="space-y-1 max-h-44 overflow-y-auto">
            {[...weightLogs].reverse().map((entry, idx) => (<div key={entry.id || idx} className="py-1.5 px-2.5 rounded bg-[var(--card-subtle-bg)] border border-[var(--card-border)] flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-bold">{entry.date}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">{entry.weightKg} kg</span>
                  {weightLogs.length > 1 && (<button type="button" onClick={() => onDeleteWeight(entry.id)} className="text-zinc-500 hover:text-red-400 text-[10px] cursor-pointer">
                      Remove
                    </button>)}
                </div>
              </div>))}
          </div>
        </div>)}
    </div>);
});
WeeklyCheckInHistorySection.displayName = 'WeeklyCheckInHistorySection';

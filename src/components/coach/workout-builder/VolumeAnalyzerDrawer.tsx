'use client';

import React from 'react';
import { Flame, X } from 'lucide-react';

interface VolumeMetrics {
  totalWeeklySets: number;
  totalSplitMovements: number;
  muscleSets: Record<string, number>;
  totalEstimatedMinutes: number;
  activeDaySets: number;
}

interface VolumeAnalyzerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  volumeMetrics: VolumeMetrics;
}

export const VolumeAnalyzerDrawer: React.FC<VolumeAnalyzerDrawerProps> = ({
  isOpen,
  onClose,
  volumeMetrics
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Click-outside backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-35 animate-in fade-in duration-150"
      />
      <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-[#080c14] border-l border-[#141b26] p-4 shadow-2xl z-40 flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#141a24]">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-slate-300" />
              <h4 className="text-xs font-bold text-white">Volume Analyzer</h4>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#05080e] border border-[#16202e] text-center">
              <span className="text-[9px] uppercase text-slate-500 block">Total Sets</span>
              <span className="text-sm font-bold text-white font-numeric">{volumeMetrics.totalWeeklySets}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#05080e] border border-[#16202e] text-center">
              <span className="text-[9px] uppercase text-slate-500 block">Est. Time</span>
              <span className="text-sm font-bold text-white font-numeric">~{volumeMetrics.totalEstimatedMinutes}m/wk</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Muscle Volume Distribution
            </span>
            <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar pr-1">
              {Object.entries(volumeMetrics.muscleSets).map(([muscle, sets]) => {
                const pct = Math.min(100, Math.round((sets / Math.max(1, volumeMetrics.totalWeeklySets)) * 100));
                return (
                  <div key={muscle} className="p-2 rounded-lg bg-[#05080e] border border-[#16202e]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{muscle}</span>
                      <span className="text-white font-mono font-bold font-numeric">{sets} sets</span>
                    </div>
                    <div className="w-full h-1 bg-[#141b26] rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#141a24] text-center">
          <span className="text-[10px] text-slate-500 font-mono">Calculated from active training days</span>
        </div>
      </aside>
    </>
  );
};

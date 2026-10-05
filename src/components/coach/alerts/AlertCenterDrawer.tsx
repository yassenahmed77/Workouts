'use client';

import React, { useState, useMemo } from 'react';
import { CoachAlert, AlertPriority } from '@/lib/alertsEngine';
import { X, CheckCircle2 } from 'lucide-react';

interface AlertCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: CoachAlert[];
  onNavigateToClient: (clientId: string, subTab: 'overview' | 'checkins' | 'workout' | 'nutrition' | 'logs') => void;
}

export const AlertCenterDrawer: React.FC<AlertCenterDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onNavigateToClient
}) => {
  const [filter, setFilter] = useState<'ALL' | AlertPriority>('ALL');

  const filteredAlerts = useMemo(() => {
    if (filter === 'ALL') return alerts;
    return alerts.filter((a) => a.priority === filter);
  }, [alerts, filter]);

  const criticalCount = alerts.filter((a) => a.priority === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => a.priority === 'WARNING').length;
  const infoCount = alerts.filter((a) => a.priority === 'INFO').length;

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-md bg-[#080c14] border-l border-[#16202e] flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-3.5 border-b border-[#16202e] flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white tracking-tight">
                Alert Center
              </h2>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#111827] text-[#94a3b8] border border-[#1f293d]">
                {alerts.length} total
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              Automated items requiring coach action
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0f1724] hover:bg-[#16202e] border border-[#1f293d] text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
            title="Close Alert Center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Filter Bar */}
        <div className="px-5 py-2.5 border-b border-[#16202e] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-white text-[#080c14] font-semibold shadow-sm'
                : 'bg-[#0f1724] text-[#64748b] hover:text-white border border-[#16202e]'
            }`}
          >
            All ({alerts.length})
          </button>

          <button
            onClick={() => setFilter('CRITICAL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'CRITICAL'
                ? 'bg-[#1a131b] text-rose-300 border border-rose-500/40 shadow-sm'
                : 'bg-[#0f1724] text-[#64748b] hover:text-rose-300 border border-[#16202e]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Critical ({criticalCount})</span>
          </button>

          <button
            onClick={() => setFilter('WARNING')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'WARNING'
                ? 'bg-[#1c1710] text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-[#0f1724] text-[#64748b] hover:text-amber-300 border border-[#16202e]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Warning ({warningCount})</span>
          </button>

          <button
            onClick={() => setFilter('INFO')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'INFO'
                ? 'bg-[#101924] text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-[#0f1724] text-[#64748b] hover:text-cyan-300 border border-[#16202e]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Info ({infoCount})</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const isCritical = alert.priority === 'CRITICAL';
              const isWarning = alert.priority === 'WARNING';

              return (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-[#090e17] border border-[#16202e] hover:border-[#223247] transition-all text-left space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1f293d] text-zinc-300 font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                        {alert.clientAvatar}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">
                          {alert.clientName}
                        </span>
                        <span className="text-[10px] text-[#64748b] font-mono block truncate">
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#111827] text-zinc-300 border border-[#1f293d] flex items-center gap-1.5">
                      <span 
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCritical 
                            ? 'bg-rose-400' 
                            : isWarning 
                            ? 'bg-amber-400' 
                            : 'bg-cyan-400'
                        }`} 
                      />
                      <span>{alert.priority}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-[#94a3b8] mt-1 leading-relaxed">
                      {alert.reason}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#141c28] flex items-center justify-end">
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToClient(alert.clientId, alert.targetSubTab);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-[#080c14] text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
                    >
                      {alert.actionLabel}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center rounded-xl bg-[#090e17] border border-[#16202e] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#111827] text-emerald-400 border border-[#1f293d] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">All Clear</h4>
                <p className="text-[11px] text-[#64748b] mt-0.5 max-w-xs mx-auto">
                  No alerts match your current filter. Your athletes are adhering to their protocols.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

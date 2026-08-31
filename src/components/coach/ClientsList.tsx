'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, WorkoutPlan, WorkoutLog } from '@/types';
import { 
  Users, 
  Search, 
  Plus, 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  LogIn,
  Copy,
  Check,
  Link as LinkIcon,
  Edit3,
  Flame,
  Eye,
  Sparkles,
  Layers,
  ChevronRight,
  Shield,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { EditTraineeModal } from '@/components/modals/EditTraineeModal';

interface ClientsListProps {
  onOpenAssignModal: (user: User) => void;
  onOpenPlanBuilderForUser: (userId: string, plan?: WorkoutPlan) => void;
  onOpenNewTraineeModal: () => void;
  onSelectTraineeDetails: (user: User) => void;
  onSwitchToTrainee: (userId: string) => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({
  onOpenAssignModal,
  onOpenPlanBuilderForUser,
  onOpenNewTraineeModal,
  onSelectTraineeDetails,
  onSwitchToTrainee
}) => {
  const { users, plans, logs, currentUser } = useGym();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTrainee, setEditingTrainee] = useState<User | null>(null);

  const trainees = useMemo(() => users.filter((u) => u.role === 'trainee'), [users]);

  const filteredTrainees = useMemo(() => {
    return trainees.filter((t) => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.goal.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && t.assignedPlanId) ||
        (statusFilter === 'pending' && !t.assignedPlanId);

      return matchesSearch && matchesStatus;
    });
  }, [trainees, searchQuery, statusFilter]);

  const activePlansCount = trainees.filter((t) => t.assignedPlanId).length;
  const pendingPlansCount = trainees.length - activePlansCount;

  // Total gym volume moved across all logs
  const totalGymVolumeKg = useMemo(() => {
    return logs.reduce((sum, l) => sum + (l.totalVolumeKg || 0), 0);
  }, [logs]);

  // Recent Athlete Logs (Last 4 sessions)
  const recentLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  }, [logs]);

  const handleCopyAthleteLink = (traineeId: string, name: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?user=${traineeId}`;
      navigator.clipboard.writeText(url);
      setCopiedId(traineeId);
      showToast(`Copied athlete portal link for ${name}! 🔗`, 'success');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-10">
      
      {/* 1. Hero Card: Cyber Sunset Coach Command Center (Exact match to Trainee Dashboard) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] relative overflow-hidden shadow-xl space-y-4">
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Header Badge & Coach Title */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#ff6b00] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20">
                <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                HEAD COACH PROTOCOL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1.5">
              {currentUser?.name || 'Coach Yassen Ahmed'} ⚡
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Athlete Roster & High-Performance Hypertrophy Command Center.
            </p>
          </div>

          <button
            onClick={onOpenNewTraineeModal}
            className="px-3.5 py-2 rounded-xl btn-orange text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Athlete</span>
          </button>
        </div>

        {/* Dynamic 4-Metric Grid Strip (100% Dynamic Math) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1e202c]">
          {/* Stat 1: Total Athletes */}
          <div className="p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Roster</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-sm font-extrabold font-numeric text-white">{trainees.length}</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block font-medium">Athletes</span>
          </div>

          {/* Stat 2: Active Protocols */}
          <div className="p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Protocols</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-extrabold font-numeric text-emerald-400">{activePlansCount}</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block font-medium">Active Plans</span>
          </div>

          {/* Stat 3: Logged Sessions */}
          <div className="p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Activity</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Activity className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span className="text-sm font-extrabold font-numeric text-white">{logs.length}</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block font-medium">Workouts</span>
          </div>

          {/* Stat 4: Pending / Attention */}
          <div className="p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Attention</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <AlertCircle className={`w-3.5 h-3.5 ${pendingPlansCount > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
              <span className={`text-sm font-extrabold font-numeric ${pendingPlansCount > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                {pendingPlansCount}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block font-medium">Needs Setup</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onOpenPlanBuilderForUser('')}
          className="p-3.5 rounded-2xl bg-[#111218] border border-[#212330] hover:border-[#ff6b00]/40 hover:bg-[#14151e] transition-all flex items-center justify-between text-left group shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#171822] text-[#ff6b00] border border-[#282a3a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white group-hover:text-[#ff6b00] transition-colors">
                Split Architect
              </h3>
              <p className="text-[10px] text-zinc-400">Design workout split</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#ff6b00] transition-colors" />
        </button>

        <button
          onClick={onOpenNewTraineeModal}
          className="p-3.5 rounded-2xl bg-[#111218] border border-[#212330] hover:border-[#ff6b00]/40 hover:bg-[#14151e] transition-all flex items-center justify-between text-left group shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#171822] text-emerald-400 border border-[#282a3a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                New Athlete
              </h3>
              <p className="text-[10px] text-zinc-400">Register trainee</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>

      {/* 3. Live Athlete Activity Stream (Recent Completed Sessions) */}
      {recentLogs.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#111218] border border-[#212330] shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ff6b00]" />
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Live Athlete Activity
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18151f] text-[#ff6b00] border border-[#ff6b00]/20">
              {logs.length} Total Logs
            </span>
          </div>

          <div className="space-y-2">
            {recentLogs.map((log) => {
              const athlete = users.find((u) => u.id === log.userId);
              return (
                <div
                  key={log.id}
                  onClick={() => onSwitchToTrainee(log.userId)}
                  className="p-3 rounded-2xl bg-[#09090b] border border-[#1e202c] hover:border-[#35384d] hover:bg-[#14151e] transition-all cursor-pointer flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-[#171822] text-[#ff6b00] font-mono text-xs font-black flex items-center justify-center flex-shrink-0 border border-[#252736]">
                      {athlete?.avatarText || 'AT'}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-white text-xs truncate group-hover:text-[#ff6b00] transition-colors">
                        {athlete?.name || 'Athlete'}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate">
                        Completed {log.dayName} • {log.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 font-numeric text-xs">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#161722] border border-[#252736] font-mono font-bold text-[#ff6b00] text-[11px]">
                      {log.completedExercises?.length || 0} Exercises
                    </span>
                    <span className="font-bold text-zinc-400 text-[11px]">
                      {log.totalVolumeKg} kg
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#ff6b00] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Athlete Roster Management Section */}
      <div className="space-y-3.5">
        
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete by name, email, or goal..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#111218] border border-[#212330] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60 transition-colors shadow-sm"
            />
          </div>

          <div className="flex items-center bg-[#111218] border border-[#212330] rounded-2xl p-1 text-xs font-semibold shadow-sm">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#1e202c] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({trainees.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'active' ? 'bg-[#1e202c] text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Active ({activePlansCount})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'pending' ? 'bg-[#1e202c] text-amber-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Pending ({pendingPlansCount})
            </button>
          </div>
        </div>

        {/* Athlete Cards List */}
        <div className="space-y-3.5">
          {filteredTrainees.map((trainee) => {
            const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
            const traineeLogs = logs.filter((l) => l.userId === trainee.id);
            const isCopied = copiedId === trainee.id;

            return (
              <div
                key={trainee.id}
                className="p-5 rounded-3xl bg-[#111218] border border-[#212330] hover:border-[#35384d] transition-all shadow-md space-y-4 group"
              >
                {/* Athlete Identity Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-10 h-10 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#2e303d] font-mono text-sm font-black flex items-center justify-center flex-shrink-0 shadow-inner">
                      {trainee.avatarText}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
                          {trainee.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingTrainee(trainee)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
                          title="Edit athlete profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {trainee.email}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {assignedPlan ? (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-950/40 text-amber-400 border border-amber-800/40 flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      NEEDS PLAN
                    </span>
                  )}
                </div>

                {/* Biometrics Strip */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center font-numeric">
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Weight</span>
                    <span className="text-xs font-extrabold text-white">{trainee.weightKg} kg</span>
                  </div>
                  <div className="border-x border-[#1e202c]">
                    <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Target</span>
                    <span className="text-xs font-extrabold text-zinc-300">{trainee.targetWeightKg || trainee.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Logs</span>
                    <span className="text-xs font-extrabold text-[#ff6b00]">{traineeLogs.length}</span>
                  </div>
                </div>

                {/* Assigned Workout Plan Banner (Spacious Mobile-First Stacking) */}
                <div className="p-3.5 rounded-2xl bg-[#0a0a0d] border border-[#1e202a] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      Assigned Workout Split
                    </span>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          if (assignedPlan) {
                            onOpenPlanBuilderForUser(trainee.id, assignedPlan);
                          } else {
                            onOpenPlanBuilderForUser(trainee.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-xl btn-orange text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-md active:scale-95 transition-all"
                        title={assignedPlan ? 'Modify exercises in this split' : 'Build custom split'}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{assignedPlan ? 'Edit Split' : 'Build Split'}</span>
                      </button>
                      
                      <button
                        onClick={() => onOpenAssignModal(trainee)}
                        className="p-1.5 rounded-xl bg-[#171822] hover:bg-[#202230] border border-[#2e303d] text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                        title="Pick / switch master template"
                      >
                        <Target className="w-3.5 h-3.5 text-[#ff6b00]" />
                      </button>
                    </div>
                  </div>

                  {assignedPlan ? (
                    <div>
                      <h4 className="text-sm font-extrabold text-white leading-snug">
                        {assignedPlan.title}
                      </h4>
                      <p className="text-[11px] text-[#ff6b00] font-mono font-bold mt-0.5">
                        {assignedPlan.daysPerWeek} Days/Wk • {assignedPlan.durationWeeks} Wks • {assignedPlan.days.reduce((acc, d) => acc + d.exercises.length, 0)} Movements
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-amber-400/90">
                      No split assigned yet
                    </p>
                  )}
                </div>

                {/* Action Buttons Hub */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1e202c]">
                  {/* Switch to Athlete Live Phone View */}
                  <button
                    onClick={() => onSwitchToTrainee(trainee.id)}
                    className="py-2.5 rounded-xl btn-orange text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5 fill-current" />
                    <span>View App</span>
                  </button>

                  {/* Coach Notes & Profile Modal */}
                  <button
                    onClick={() => onSelectTraineeDetails(trainee)}
                    className="py-2.5 rounded-xl bg-[#09090b] hover:bg-[#161722] border border-[#1e202c] text-xs font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Notes</span>
                  </button>

                  {/* Copy Portal Link */}
                  <button
                    onClick={() => handleCopyAthleteLink(trainee.id, trainee.name)}
                    className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isCopied
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                        : 'bg-[#09090b] hover:bg-[#161722] border-[#1e202c] text-zinc-300 hover:text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTrainees.length === 0 && (
            <div className="p-10 text-center rounded-3xl bg-[#111218] border border-[#212330] shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#2e303d] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">No Athletes Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Register a new trainee to assign workout splits, protocols, and track their strength gains!
              </p>
              <button
                onClick={onOpenNewTraineeModal}
                className="px-5 py-2.5 rounded-xl btn-orange text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md active:scale-95 mt-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add First Athlete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Athlete Profile Modal */}
      {editingTrainee && (
        <EditTraineeModal
          isOpen={Boolean(editingTrainee)}
          onClose={() => setEditingTrainee(null)}
          user={editingTrainee}
        />
      )}
    </div>
  );
};

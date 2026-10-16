/**
 * @file ClientsTable.jsx
 * @description جدول المتدربين الكامل لسطح المكتب والتابلت (Desktop Data Table)
 * يعرض المتدربين في جدول بيانات منسق مع إحصائيات الحضور والوزن والدايت.
 */

import React from 'react';
import { MessageCircle, MoreVertical } from 'lucide-react';
import { clientService } from '@/services/clientService';

export function ClientsTable({
  trainees,
  plans,
  getDietPlanForUser,
  getCheckInsForUser,
  getWorkoutWeeklyProgress,
  getAthleteStatus,
  formatSimpleAttention,
  activeActionMenuId,
  onOpenMenu,
  onSelectTraineeDetails,
  onOpenAssignModal,
  onOpenAssignDiet
}) {
  return (
    <div className="hidden md:flex flex-col flex-1 min-h-0 gym-card p-0 overflow-hidden shadow-lg border border-white/[0.07]">
      <div className="w-full h-full overflow-x-auto overflow-y-hidden custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-full">
          <thead className="sticky top-0 bg-[var(--card-subtle-bg)] z-10">
            <tr className="border-b border-white/[0.07] bg-[var(--card-subtle-bg)] text-[10px] xl:text-[10px] min-[1388px]:text-[10.5px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-2 px-2 md:px-2.5 text-left whitespace-nowrap min-w-[180px] md:min-w-[200px] xl:min-w-[210px] min-[1388px]:min-w-[250px]">
                Athlete
              </th>
              <th className="py-2 px-1 text-center whitespace-nowrap min-w-[65px] lg:min-w-[72px] xl:min-w-[78px] min-[1388px]:min-w-[88px]">
                Membership
              </th>
              <th className="py-2 px-1 text-center whitespace-nowrap min-w-[58px] lg:min-w-[76px] xl:min-w-[82px] min-[1388px]:min-w-[95px]">
                <span className="hidden lg:inline">Current / Target</span>
                <span className="lg:hidden">Weight</span>
              </th>
              <th className="py-2 px-1 text-center whitespace-nowrap min-w-[72px] lg:min-w-[85px] xl:min-w-[95px] min-[1388px]:min-w-[115px]">
                Workout Split
              </th>
              <th className="py-2 px-1 text-center whitespace-nowrap min-w-[62px] lg:min-w-[74px] xl:min-w-[80px] min-[1388px]:min-w-[90px]">
                Diet Plan
              </th>
              <th className="hidden xl:table-cell py-2 px-1 text-center whitespace-nowrap min-w-[70px] xl:min-w-[78px] min-[1388px]:min-w-[95px]">
                Attention
              </th>
              <th className="py-2 px-1 text-center whitespace-nowrap min-w-[55px] lg:min-w-[82px] xl:min-w-[90px] min-[1388px]:min-w-[105px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-xs">
            {trainees.map((trainee) => {
              const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
              const assignedDiet = getDietPlanForUser(trainee.id);
              const traineeCheckIns = getCheckInsForUser(trainee.id);
              const workoutProg = getWorkoutWeeklyProgress(trainee);
              const isMenuOpen = activeActionMenuId === trainee.id;

              const statusBadge = getAthleteStatus(trainee);
              const membershipBadge = clientService.getMembershipBadge(trainee);
              const attention = formatSimpleAttention(trainee, traineeCheckIns);

              const earliestCheckIn = traineeCheckIns.length > 0
                ? [...traineeCheckIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
                : null;
              const weightDelta = earliestCheckIn
                ? Number((trainee.weightKg - earliestCheckIn.weightKg).toFixed(1))
                : null;

              return (
                <tr 
                  key={trainee.id}
                  className="hover:bg-white/[0.03] transition-colors group relative"
                >
                  {/* عمود المتدرب */}
                  <td className="py-1.5 px-2 md:px-2.5 text-left align-middle min-w-[180px] md:min-w-[200px] xl:min-w-[210px] min-[1388px]:min-w-[250px]">
                    <div className="flex items-center gap-2 xl:gap-2">
                      <div 
                        onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                        className="relative cursor-pointer flex-shrink-0 self-center"
                      >
                        {trainee.avatarUrl ? (
                          <img
                            src={trainee.avatarUrl}
                            alt={trainee.name}
                            className="w-8 h-8 rounded-full object-cover border border-[var(--card-border)] group-hover:border-white/20 transition-colors shadow-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--card-subtle-bg)] text-slate-400 border border-[var(--card-border)] font-mono text-[10.5px] font-semibold flex items-center justify-center group-hover:border-white/20 transition-colors shadow-sm">
                            {trainee.avatarText}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h3 
                          onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                          className="text-xs md:text-[12px] xl:text-[12.5px] min-[1388px]:text-[13px] font-semibold text-white group-hover:text-[var(--main-color)] transition-colors cursor-pointer truncate whitespace-nowrap leading-tight flex items-center gap-1.5"
                        >
                          <span className="truncate">{trainee.name}</span>
                          {attention.dot && (
                            <span 
                              className={`xl:hidden w-1.5 h-1.5 rounded-full ${attention.dot} shrink-0`} 
                              title={`${attention.label}${attention.timeframe ? ` • ${attention.timeframe}` : ''}`}
                            />
                          )}
                        </h3>
                        <div className="relative h-3.5 mt-0.5 min-w-[160px] md:min-w-[180px] xl:min-w-[190px] min-[1388px]:min-w-[230px] w-full">
                          <p className="text-[9.5px] md:text-[9.5px] xl:text-[10px] text-slate-400 font-normal whitespace-nowrap absolute inset-0 transition-opacity duration-150 group-hover:opacity-0 pointer-events-none">
                            {trainee.gender || 'Athlete'} &bull; {trainee.age ? `${trainee.age} y/o` : 'Active'} &bull; {trainee.email}
                          </p>
                          {/* روابط الانتقال السريع عند التمرير */}
                          <div className="flex items-center gap-1.5 xl:gap-1.5 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap flex-nowrap z-10">
                            <button
                              type="button"
                              onClick={() => onSelectTraineeDetails(trainee, 'checkins')}
                              className="text-[10px] text-[var(--main-color)] hover:text-[var(--main-color-hover)] transition-colors cursor-pointer font-medium hover:underline leading-none whitespace-nowrap flex-shrink-0"
                            >
                              Check-ins
                            </button>
                            <span className="text-slate-600 text-[9px] leading-none flex-shrink-0">&bull;</span>
                            <button
                              type="button"
                              onClick={() => onSelectTraineeDetails(trainee, 'workout')}
                              className="text-[10px] text-[var(--main-color)] hover:text-[var(--main-color-hover)] transition-colors cursor-pointer font-medium hover:underline leading-none whitespace-nowrap flex-shrink-0"
                            >
                              Split
                            </button>
                            <span className="text-slate-600 text-[9px] leading-none flex-shrink-0">&bull;</span>
                            <button
                              type="button"
                              onClick={() => onSelectTraineeDetails(trainee, 'nutrition')}
                              className="text-[10px] text-[var(--main-color)] hover:text-[var(--main-color-hover)] transition-colors cursor-pointer font-medium hover:underline leading-none whitespace-nowrap flex-shrink-0"
                            >
                              Diet
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* عمود الباقة */}
                  <td className="py-1.5 px-1 text-center align-middle whitespace-nowrap">
                    <span className="text-[10px] xl:text-[10.5px] min-[1388px]:text-[11px] font-mono font-medium text-slate-300">
                      {membershipBadge.label}
                    </span>
                  </td>

                  {/* عمود الوزن المستهدف والحالي */}
                  <td className="py-1.5 px-1 text-center align-middle">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-[10.5px] xl:text-[11px] min-[1388px]:text-[11.5px] font-medium text-white font-numeric whitespace-nowrap flex items-center justify-center gap-1 min-[1388px]:gap-1.5">
                        <span>{trainee.weightKg} kg</span>
                        <span className="hidden lg:inline text-slate-500">/</span>
                        <span className="hidden lg:inline text-slate-400">{trainee.targetWeightKg || trainee.weightKg} kg</span>
                        {weightDelta !== null && (
                          <span
                            className={`hidden lg:inline text-[9px] font-mono px-0.5 py-0.2 rounded border ml-0.5 ${
                              weightDelta < 0
                                ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
                                : weightDelta > 0
                                ? 'bg-amber-950/30 text-amber-400 border-amber-500/20'
                                : 'bg-[var(--card-subtle-bg)] text-slate-400 border-[var(--card-border)]'
                            }`}
                            title="Weight change since first check-in"
                          >
                            {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* عمود خطة التمرين ومعدل الحضور */}
                  <td className="py-1.5 px-1 text-center align-middle">
                    <div className="flex flex-col items-center justify-center">
                      {assignedPlan ? (
                        <div 
                          onClick={() => onSelectTraineeDetails(trainee, 'workout')}
                          className="cursor-pointer group/split flex flex-col items-center justify-center"
                        >
                          <p className="text-[10.5px] xl:text-[11px] min-[1388px]:text-[11.5px] font-medium text-white group-hover/split:text-slate-200 transition-colors whitespace-nowrap truncate max-w-[90px] xl:max-w-[95px] min-[1388px]:max-w-[125px] leading-tight">
                            {assignedPlan.title}
                          </p>
                          <div className="w-14 xl:w-16 min-[1388px]:w-22 h-1 rounded-full bg-[var(--card-subtle-bg)] mt-1 overflow-hidden mx-auto">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                workoutProg.workoutPct >= 100
                                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                  : workoutProg.workoutPct >= 50
                                  ? 'bg-[var(--main-color)] shadow-[0_0_8px_var(--main-color-glow)]'
                                  : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                              }`}
                              style={{ width: `${workoutProg.workoutPct}%` }}
                            />
                          </div>
                          <p className="text-[8.5px] xl:text-[9px] min-[1388px]:text-[9.5px] text-slate-400 font-mono whitespace-nowrap mt-0.5 leading-tight">
                            {workoutProg.completedDays} of {workoutProg.targetDays} &bull; {workoutProg.workoutPct}%
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenAssignModal(trainee)}
                          className="text-[9px] xl:text-[9.5px] min-[1388px]:text-[10px] font-medium text-slate-400 hover:text-white whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-1.5 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] transition-colors"
                        >
                          <span>Build Split</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* عمود النظام الغذائي */}
                  <td className="py-1.5 px-1 text-center align-middle">
                    <div className="flex flex-col items-center justify-center">
                      {assignedDiet ? (
                        <button
                          type="button"
                          onClick={() => onSelectTraineeDetails(trainee, 'nutrition')}
                          className="text-[9px] xl:text-[9.5px] min-[1388px]:text-[10px] font-mono font-medium text-white hover:text-[var(--main-color)] whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-1.5 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 transition-colors"
                          title={`View Diet: ${assignedDiet.title}`}
                        >
                          <span>{assignedDiet.targetCalories ? `${assignedDiet.targetCalories.toLocaleString()} kcal/d` : 'View Diet'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenAssignDiet(trainee)}
                          className="text-[9px] xl:text-[9.5px] min-[1388px]:text-[10px] font-medium text-slate-400 hover:text-white whitespace-nowrap inline-flex items-center justify-center cursor-pointer py-0.5 px-1.5 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] transition-colors"
                        >
                          <span>Build Diet</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* عمود التنبيهات (Attention) */}
                  <td className="hidden xl:table-cell py-1.5 px-1 text-center align-middle">
                    <div className="flex flex-col items-center justify-center">
                      {!attention.dot ? (
                        <span className="text-[10px] xl:text-[10.5px] min-[1388px]:text-[11px] text-slate-400 whitespace-nowrap font-normal">
                          &mdash; All Good
                        </span>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                            <span className={`w-1.5 h-1.5 rounded-full ${attention.dot} flex-shrink-0`} />
                            <span className="text-[10px] xl:text-[10.5px] min-[1388px]:text-[11px] font-medium text-white leading-tight">
                              {attention.label}
                            </span>
                          </div>
                          {attention.timeframe && (
                            <span className="text-[8.5px] xl:text-[9px] min-[1388px]:text-[9.5px] text-slate-400 whitespace-nowrap mt-0.5 font-mono leading-tight">
                              {attention.timeframe}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* عمود الأزرار السريعة (Actions) */}
                  <td className="py-1.5 px-1 text-center whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1 min-[1388px]:gap-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cleanPhone = (trainee.phone || '+201012345678').replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 hover:border-emerald-700/50 text-emerald-400 transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                        title={`Open WhatsApp (${trainee.phone || '+20 101 234 5678'})`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTraineeDetails(trainee, 'overview')}
                        className="hidden lg:inline-flex py-1 px-1.5 xl:px-1.5 min-[1388px]:px-2.5 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] hover:border-white/20 text-[9.5px] xl:text-[10px] min-[1388px]:text-[10.5px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer items-center active:scale-95 shadow-sm whitespace-nowrap flex-nowrap flex-shrink-0"
                        title="Open full athlete profile & progress 360"
                      >
                        <span className="whitespace-nowrap">Full Profile</span>
                      </button>

                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => onOpenMenu(e, trainee)}
                          className={`p-1 min-[1440px]:p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
                            isMenuOpen 
                              ? 'bg-white/[0.08] border-white/20 text-white' 
                              : 'bg-[var(--card-subtle-bg)] border-[var(--card-border)] text-slate-400 hover:text-white hover:border-white/20'
                          }`}
                          title="More Actions"
                        >
                          <MoreVertical className="w-3 h-3 min-[1440px]:w-3.5 min-[1440px]:h-3.5 flex-shrink-0" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  CigaretteOff, 
  Plus,
  Filter 
} from 'lucide-react';
import { useTraineeHabits } from '@/hooks/useTraineeHabits';
import { QuitHabitCard } from './habits/QuitHabitCard';
import { DailyHabitCard } from './habits/DailyHabitCard';
import { HabitAddEditModal } from './habits/HabitAddEditModal';
import { RelapseReflectionModal } from './habits/RelapseReflectionModal';
import { HabitsHeroSection } from './habits/HabitsHeroSection';
export { RenderHabitIcon } from './habits/RenderHabitIcon';

export const TraineeHabitsView: React.FC = () => {
  const {
    currentUser,
    habits,
    quitHabits,
    dailyHabits,
    filteredHabits,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    editingHabit,
    relapseModalHabit,
    setRelapseModalHabit,
    relapseNote,
    setRelapseNote,
    modeType,
    setModeType,
    title,
    setTitle,
    category,
    setCategory,
    type,
    setType,
    targetValue,
    setTargetValue,
    unit,
    setUnit,
    iconKey,
    setIconKey,
    color,
    setColor,
    quitCategory,
    setQuitCategory,
    targetDays,
    setTargetDays,
    startedAt,
    setStartedAt,
    cigarettesPerDay,
    setCigarettesPerDay,
    pricePerPack,
    setPricePerPack,
    cigarettesPerPack,
    setCigarettesPerPack,
    savingsPerDay,
    setSavingsPerDay,
    currency,
    setCurrency,
    avoidedUnitsPerDay,
    setAvoidedUnitsPerDay,
    avoidedUnitLabel,
    setAvoidedUnitLabel,
    motivationReason,
    setMotivationReason,
    calculatedDailySmokingCost,
    handleOpenAddModal,
    handleSelectPreset,
    handleOpenEditModal,
    handleSaveHabit,
    handleDeleteHabit,
    handleOpenRelapseModal,
    handleConfirmRelapse,
    handleToggleBooleanHabit,
    handleAdjustNumericHabit,
    summary,
    quitSavings
  } = useTraineeHabits();

  const [dailyCategory, setDailyCategory] = useState<string>('all');

  const displayedHabits = useMemo(() => {
    if (activeTab === 'daily' && dailyCategory !== 'all') {
      return filteredHabits.filter((h) => h.category === dailyCategory);
    }
    return filteredHabits;
  }, [filteredHabits, activeTab, dailyCategory]);

  if (!currentUser) return null;

  return (
    <div className="w-full max-w-xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 pb-28 md:pb-12 px-1 sm:px-0">
      
      {/* 1. Header: Top Action Bar & Title */}
      <div className="space-y-3 pt-1">
        {/* Title Row */}
        <div className="text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#2f80ed] font-bold block">
            DISCIPLINE & SOBRIETY
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight whitespace-nowrap">
            Habits Tracker
          </h1>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleOpenAddModal('daily')}
            className="py-2 px-3 rounded-xl bg-[#18191e] hover:bg-[#1c1d22] border border-[#24262e] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#2f80ed]" />
            <span>Add Routine</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('quit')}
            className="py-2 px-3 rounded-xl btn-cyan text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-[#2f80ed]/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <CigaretteOff className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Quit Bad Habit</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Section: Consistency Arc & Dynamic Stats */}
      <HabitsHeroSection 
        summary={summary}
        quitSavings={quitSavings}
        totalHabitsCount={habits.length}
      />

      {/* 3. Segmented Filter Pills */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 p-1 rounded-xl bg-[#141519] border border-[#24262e] text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setDailyCategory('all');
            }}
            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#18191e] text-white shadow-sm border border-[#24262e]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All ({habits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quit')}
            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
              activeTab === 'quit'
                ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#24262e]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Quit Timers ({quitHabits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-[#18191e] text-white shadow-sm border border-[#24262e]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Daily ({dailyHabits.length})
          </button>
        </div>

        {/* Daily Categories Filter Tags (visible when Daily tab is active) */}
        {activeTab === 'daily' && dailyHabits.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {['all', 'Supplement', 'Nutrition', 'Recovery', 'Fitness', 'Lifestyle', 'Mindset'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setDailyCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer text-[11px] ${
                  dailyCategory === cat
                    ? 'bg-[#2f80ed] text-white shadow-sm'
                    : 'bg-[#141519] text-zinc-400 hover:text-zinc-200 border border-[#24262e]'
                }`}
              >
                {cat === 'all' ? 'All Routines' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Main Habits Stack: Responsive Grid on Desktop */}
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
        {displayedHabits.map((habit) => {
          if (habit.type === 'quit') {
            return (
              <QuitHabitCard
                key={habit.id}
                habit={habit}
                onOpenRelapseModal={handleOpenRelapseModal}
                onOpenEditModal={handleOpenEditModal}
                onDeleteHabit={handleDeleteHabit}
              />
            );
          }

          return (
            <DailyHabitCard
              key={habit.id}
              habit={habit}
              userId={currentUser.id}
              onOpenEditModal={handleOpenEditModal}
              onDeleteHabit={handleDeleteHabit}
              onToggleBoolean={handleToggleBooleanHabit}
              onAdjustNumeric={handleAdjustNumericHabit}
            />
          );
        })}

        {displayedHabits.length === 0 && (
          <div className="p-8 rounded-3xl bg-[#18191e] border border-[#24262e] text-center shadow-md space-y-3 md:col-span-2">
            <div className="w-12 h-12 rounded-2xl bg-[#141519] text-[#2f80ed] border border-[#24262e] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">No Habits In This View</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {activeTab === 'quit' 
                ? 'Create a Quit Bad Habit protocol (Smoking, Sugar, Screens, etc.) with live clocks and savings calculators.' 
                : 'Start tracking your daily hydration, supplements, or sleep routines.'}
            </p>
            <button
              onClick={() => handleOpenAddModal(activeTab === 'quit' ? 'quit' : 'daily')}
              className="btn-cyan px-5 py-2.5 rounded-xl text-white text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md shadow-[#2f80ed]/30 active:scale-95 mt-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create {activeTab === 'quit' ? 'Quit Protocol' : 'Daily Habit'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Create / Edit Modal */}
      <HabitAddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingHabit={editingHabit}
        modeType={modeType}
        setModeType={setModeType}
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        type={type}
        setType={setType}
        targetValue={targetValue}
        setTargetValue={setTargetValue}
        unit={unit}
        setUnit={setUnit}
        iconKey={iconKey}
        setIconKey={setIconKey}
        color={color}
        setColor={setColor}
        quitCategory={quitCategory}
        setQuitCategory={setQuitCategory}
        targetDays={targetDays}
        setTargetDays={setTargetDays}
        startedAt={startedAt}
        setStartedAt={setStartedAt}
        cigarettesPerDay={cigarettesPerDay}
        setCigarettesPerDay={setCigarettesPerDay}
        pricePerPack={pricePerPack}
        setPricePerPack={setPricePerPack}
        cigarettesPerPack={cigarettesPerPack}
        setCigarettesPerPack={setCigarettesPerPack}
        savingsPerDay={savingsPerDay}
        setSavingsPerDay={setSavingsPerDay}
        currency={currency}
        setCurrency={setCurrency}
        avoidedUnitsPerDay={avoidedUnitsPerDay}
        setAvoidedUnitsPerDay={setAvoidedUnitsPerDay}
        avoidedUnitLabel={avoidedUnitLabel}
        setAvoidedUnitLabel={setAvoidedUnitLabel}
        motivationReason={motivationReason}
        setMotivationReason={setMotivationReason}
        calculatedDailySmokingCost={calculatedDailySmokingCost}
        onSelectPreset={handleSelectPreset}
        onSubmit={handleSaveHabit}
      />

      {/* 4. Relapse Reflection & Reset Modal */}
      <RelapseReflectionModal
        habit={relapseModalHabit}
        onClose={() => setRelapseModalHabit(null)}
        relapseNote={relapseNote}
        setRelapseNote={setRelapseNote}
        onConfirmRelapse={handleConfirmRelapse}
      />

    </div>
  );
};

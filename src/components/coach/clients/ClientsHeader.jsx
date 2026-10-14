/**
 * @file ClientsHeader.jsx
 * @description شريط الرأس لصفحة المتدربين (Clients Header Bar)
 * يحتوي على عنوان الصفحة، زر فتح القائمة الجانبية للشاشات الصغيرة، حقل البحث، وزر إضافة متدرب جديد.
 */

import React from 'react';
import { Search, Plus, X, PanelLeft } from 'lucide-react';
import { SearchInput } from '@/components/ui';

export function ClientsHeader({
  searchQuery,
  setSearchQuery,
  onResetPage,
  isMobileSearchOpen,
  setIsMobileSearchOpen,
  isSidebarOpen,
  onToggleSidebar,
  onOpenNewTraineeModal
}) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 pb-1.5 border-b border-white/[0.07] shrink-0 min-h-[38px]">
      {isMobileSearchOpen ? (
        /* وضع شريط البحث المفتوح للموبايل */
        <div className="flex sm:hidden items-center gap-2 w-full animate-in fade-in duration-150">
          <div className="flex-1 min-w-0">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                onResetPage();
              }}
              placeholder="Search athletes..."
              className="w-full"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(false);
              setSearchQuery('');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[var(--card-subtle-bg)] border border-[var(--card-border)] cursor-pointer shrink-0"
            title="Close search"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* اليسار: عنوان الصفحة وزر القائمة الجانبية */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors flex items-center justify-center cursor-pointer shrink-0 min-[1025px]:hidden"
                title={isSidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
                aria-label="Toggle Navigation Sidebar"
              >
                <PanelLeft className="w-4 h-4 text-slate-300" />
              </button>
            )}
            <h1 className="gym-heading-page text-sm sm:text-base md:text-lg">
              Clients
            </h1>
          </div>

          {/* المنتصف: حقل البحث لسطح المكتب */}
          <div className="hidden sm:block flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-3">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                onResetPage();
              }}
              placeholder="Search athletes..."
              className="w-full"
            />
          </div>

          {/* اليمين: أيقونة بحث الموبايل + زر إضافة متدرب جديد */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="sm:hidden p-1.5 rounded-lg text-slate-300 hover:text-white bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] transition-colors flex items-center justify-center cursor-pointer"
              title="Search athletes"
              aria-label="Search athletes"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewTraineeModal}
              className="gym-btn-primary gym-btn-sm shrink-0 whitespace-nowrap text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center gap-1 cursor-pointer"
              title="Add Athlete"
              aria-label="Add Athlete"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Athlete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

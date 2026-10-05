'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export const DeleteLogModal: React.FC<DeleteLogModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Delete Workout Log Confirmation"
    >
      <div className="w-full max-w-sm bg-[#18191e] border border-[#24262e] rounded-3xl p-6 shadow-2xl text-center relative animate-in zoom-in-95 duration-150 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <Trash2 className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-white">Delete Today&apos;s Workout Log?</h3>
          <p className="text-xs text-[#94a3b8] mt-1">
            Are you sure you want to remove today&apos;s workout log from your history? Your streak and stats will be updated.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-[#1c1d22] border border-[#24262e] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-md shadow-rose-600/30"
          >
            Delete Log
          </button>
        </div>
      </div>
    </div>
  );
};

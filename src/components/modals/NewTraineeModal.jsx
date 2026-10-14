'use client';
import React from 'react';
import { useNewTraineeWizard } from '@/hooks/useNewTraineeWizard';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { TraineeProfileStep } from './new-trainee/TraineeProfileStep';
import { TraineeWorkoutStep } from './new-trainee/TraineeWorkoutStep';
import { TraineeDietStep } from './new-trainee/TraineeDietStep';

/**
 * NewTraineeModal - نافذة تسجيل متدرب جديد وتوجيهه لبناء جدول التمارين والتغذية
 *
 * تم تبسيط هذا المكون وفصل المنطق والتصميم طبقاً لـ Clean Architecture:
 * - إدارة الحالة وفحص البيانات عبر هوك `useNewTraineeWizard`.
 * - الخطوة 1 (البيانات والاشتراك) في `TraineeProfileStep`.
 * - الخطوة 2 (جدول التمارين) في `TraineeWorkoutStep`.
 * - الخطوة 3 (جدول التغذية) في `TraineeDietStep`.
 * - إغلاق النافذة بزر الهروب عبر `useEscapeKey`.
 */
export const NewTraineeModal = ({
    isOpen,
    onClose,
    onSuccessSelect,
    onNavigateToStudio,
    onNavigateToDietStudio,
    onNavigateToClient360
}) => {
    const wizard = useNewTraineeWizard({
        isOpen,
        onClose,
        onSuccessSelect,
        onNavigateToStudio,
        onNavigateToDietStudio,
        onNavigateToClient360
    });

    // إغلاق النافذة عند الضغط على Escape
    useEscapeKey(isOpen, wizard.handleClose);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer overflow-hidden"
            onClick={(e) => {
                if (e.target === e.currentTarget) wizard.handleClose();
            }}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`w-full ${
                    wizard.currentStep === 'profile' ? 'max-w-4xl' : 'max-w-lg'
                } bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 cursor-default max-h-[96dvh]`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* الخطوة 1: تسجيل بيانات المتدرب والاشتراك */}
                {wizard.currentStep === 'profile' && (
                    <TraineeProfileStep
                        wizard={wizard}
                        onNavigateToClient360={onNavigateToClient360}
                        onSuccessSelect={onSuccessSelect}
                    />
                )}

                {/* الخطوة 2: جدول التمارين واختيار Splits Studio */}
                {wizard.currentStep === 'workout' && wizard.createdAthlete && (
                    <TraineeWorkoutStep
                        createdAthlete={wizard.createdAthlete}
                        onOpenSplitsStudio={wizard.handleOpenSplitsStudio}
                        onSkipWorkout={wizard.handleSkipWorkout}
                        onClose={wizard.handleClose}
                    />
                )}

                {/* الخطوة 3: جدول التغذية واختيار Diet Studio */}
                {wizard.currentStep === 'diet' && wizard.createdAthlete && (
                    <TraineeDietStep
                        createdAthlete={wizard.createdAthlete}
                        onOpenDietStudio={wizard.handleOpenDietStudio}
                        onCompleteSetup={wizard.handleCompleteSetup}
                        onClose={wizard.handleClose}
                    />
                )}
            </div>
        </div>
    );
};

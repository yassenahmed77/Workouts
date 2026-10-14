'use client';
import { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { clientService } from '@/services/clientService';
import { sanitizeString, sanitizeNotes } from '@/lib/sanitizer';

/**
 * useNewTraineeWizard - هوك إدارة معالج تسجيل متدرب جديد
 *
 * يحتوي هذا الهوك على كامل دورة حياة إضافة اللاعب:
 * 1. بيانات الهوية (الاسم، البريد، الهاتف، النوع، السن).
 * 2. القياسات الحيوية (الوزن الحالي والمستهدف، الطول، نسبة الدهون).
 * 3. فحص تطابق الوزن المستهدف مع الهدف الرياضي (Hypertrophy vs Fat Loss).
 * 4. التحقق الفوري من الحسابات المكررة لمنع تسجيل نفس البريد أو الهاتف بالخطأ.
 * 5. تفاصيل الاشتراك وحساب تاريخ الانتهاء تلقائياً بناءً على الشهور وتخصيص السعر.
 * 6. التحقق عبر Zod وحفظ اللاعب في النظام والانتقال لخطوات تصميم الجدول الغذائي والتدريبي.
 */
export function useNewTraineeWizard({
    isOpen,
    onClose,
    onSuccessSelect,
    onNavigateToStudio,
    onNavigateToDietStudio,
    onNavigateToClient360
}) {
    const { createTrainee, coachSettings, users } = useGym();
    const { showToast } = useToast();

    // خطوات المعالج المتتابعة: 'profile' -> 'workout' -> 'diet'
    const [currentStep, setCurrentStep] = useState('profile');
    const [createdAthlete, setCreatedAthlete] = useState(null);

    // تبويب التنقل على شاشات الموبايل (info vs membership)
    const [mobileTab, setMobileTab] = useState('info');

    // السماح بإنشاء حساب ثانوي في حال وجود بريد مكرر
    const [isSecondaryAccountAllowed, setIsSecondaryAccountAllowed] = useState(false);

    // بيانات اللاعب
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('+20 ');
    const [gender, setGender] = useState('Male');
    const [age, setAge] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [targetWeightKg, setTargetWeightKg] = useState('');
    const [heightCm, setHeightCm] = useState('');
    const [bodyFatPercentage, setBodyFatPercentage] = useState('');
    const [goal, setGoal] = useState('Hypertrophy / Muscle Gain');
    const [notes, setNotes] = useState('');
    const [isCompetitor, setIsCompetitor] = useState(false);
    const [division, setDivision] = useState('Classic Physique');
    const [targetShow, setTargetShow] = useState('NPC Egypt Muscle Showdown');

    // بيانات الاشتراك
    const [subscriptionPlan, setSubscriptionPlan] = useState('Full VIP Coaching');
    const [durationMonths, setDurationMonths] = useState(3);
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        return d.toISOString().split('T')[0];
    });
    const [subscriptionPrice, setSubscriptionPrice] = useState('6000');

    // أخطاء التحقق
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // كشف فوري عن الحسابات المكررة بالبريد أو رقم الهاتف
    const existingAthlete = useMemo(() => {
        if (!users || users.length === 0) return null;
        return clientService.findExistingAthlete(users, email, phone);
    }, [users, email, phone]);

    // التحقق المنطقي من توافق الوزن المستهدف مع الهدف
    const goalWeightValidation = useMemo(() => {
        const curr = parseFloat(weightKg);
        const tgt = parseFloat(targetWeightKg);
        return clientService.validateGoalWeight(goal, curr, tgt);
    }, [goal, weightKg, targetWeightKg]);

    // حساب تاريخ نهاية الاشتراك بدقة
    const calculateEndDate = (start, months) => {
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

    // جلب سعر الباقة من إعدادات المدرب أو استخدام التسعير الافتراضي
    const findPackagePrice = (plan, months) => {
        const pkg = coachSettings?.packages?.find((p) => p.name === plan && p.durationMonths === months);
        if (pkg) return String(pkg.price);
        if (plan === 'Full VIP Coaching') return String(months === 1 ? 2500 : months === 3 ? 6000 : months === 6 ? 10500 : 18000);
        if (plan === 'Workout Only') return String(months * 1200);
        if (plan === 'Nutrition Only') return String(months * 1000);
        if (plan === 'Contest Prep') return String(months * 2200);
        return String(months * 1500);
    };

    const handleSelectPlanType = (newPlan) => {
        setSubscriptionPlan(newPlan);
        setSubscriptionPrice(findPackagePrice(newPlan, durationMonths));
    };

    const handleSelectDuration = (months) => {
        setDurationMonths(months);
        setEndDate(calculateEndDate(startDate, months));
        setSubscriptionPrice(findPackagePrice(subscriptionPlan, months));
    };

    const handleStartDateChange = (newStart) => {
        setStartDate(newStart);
        setEndDate(calculateEndDate(newStart, durationMonths));
    };

    // إعادة ضبط الحقول عند الفتح الجديد
    const resetForm = () => {
        setCurrentStep('profile');
        setMobileTab('info');
        setIsSecondaryAccountAllowed(false);
        setCreatedAthlete(null);
        setName('');
        setEmail('');
        setPhone('+20 ');
        setGender('Male');
        setAge('');
        setWeightKg('');
        setTargetWeightKg('');
        setHeightCm('');
        setBodyFatPercentage('');
        setGoal('Hypertrophy / Muscle Gain');
        setNotes('');
        setIsCompetitor(false);
        setDivision('Classic Physique');
        setTargetShow('NPC Egypt Muscle Showdown');
        setSubscriptionPlan('Full VIP Coaching');
        setDurationMonths(3);
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(calculateEndDate(today, 3));
        setSubscriptionPrice('6000');
        setErrors({});
    };

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const handleClose = () => {
        resetForm();
        if (onClose) onClose();
    };

    // عند تغيير الهدف، اقتراح وزن مستهدف ذكي
    const handleGoalChange = (newGoal) => {
        setGoal(newGoal);
        const curr = parseFloat(weightKg);
        if (!isNaN(curr) && curr > 0) {
            if (newGoal === 'Fat Loss & Conditioning') {
                setTargetWeightKg(String(Math.max(40, curr - 5)));
            } else if (newGoal === 'Hypertrophy / Muscle Gain') {
                setTargetWeightKg(String(curr + 4));
            } else if (newGoal === 'Rehabilitation & Mobility') {
                setTargetWeightKg(String(curr));
            }
        }
        if (errors.targetWeightKg) {
            setErrors((prev) => ({ ...prev, targetWeightKg: '' }));
        }
    };

    // التحقق من صحة حقول الخطوة الأولى عبر clientService
    const validateStep1 = () => {
        const errs = {};
        const parsedWeight = parseFloat(weightKg);
        const parsedTargetWeight = parseFloat(targetWeightKg);
        const parsedHeight = parseFloat(heightCm);
        const parsedAge = age ? parseInt(age, 10) : undefined;
        const parsedPrice = subscriptionPrice ? parseFloat(subscriptionPrice) : undefined;
        const parsedBodyFat = bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined;

        const validation = clientService.validateCreate({
            name: sanitizeString(name),
            email: email.trim().toLowerCase(),
            phone: sanitizeString(phone),
            gender,
            age: parsedAge,
            heightCm: isNaN(parsedHeight) ? 0 : parsedHeight,
            weightKg: isNaN(parsedWeight) ? 0 : parsedWeight,
            targetWeightKg: isNaN(parsedTargetWeight) ? 0 : parsedTargetWeight,
            goal,
            status: 'active',
            bodyFatPercentage: parsedBodyFat,
            notes: notes ? sanitizeNotes(notes) : undefined,
            isCompetitor,
            subscription: {
                planType: subscriptionPlan,
                durationMonths,
                startDate,
                endDate,
                price: parsedPrice,
                currency: coachSettings?.currency || 'EGP',
                status: 'active',
                notes: notes ? sanitizeNotes(notes) : undefined
            }
        });

        if (!validation.success) {
            validation.errors.forEach((errStr) => {
                const [field, msg] = errStr.split(': ');
                if (field === 'name') errs.name = 'Required (2-60 chars)';
                else if (field === 'email') errs.email = 'Valid email required';
                else if (field === 'heightCm') errs.heightCm = '100-250 cm';
                else if (field === 'weightKg') errs.weightKg = '30-300 kg';
                else if (field === 'targetWeightKg') errs.targetWeightKg = '30-300 kg';
                else if (field === 'age') errs.age = '12-100 yrs';
                else errs[field] = msg || 'Invalid';
            });
        }

        // فحص اتساق الهدف مع فرق الوزن
        if (!isNaN(parsedWeight) && !isNaN(parsedTargetWeight)) {
            const goalCheck = clientService.validateGoalWeight(goal, parsedWeight, parsedTargetWeight);
            if (!goalCheck.isValid && goalCheck.error) {
                errs.targetWeightKg = goalCheck.error;
            }
        }

        // قفل التسجيل في حال وجود حساب متطابق ولم يتم السماح بالحساب الثانوي
        if (existingAthlete && !isSecondaryAccountAllowed) {
            errs.duplicate = 'Athlete already exists. Select an option to proceed.';
        }

        if (isCompetitor && !targetShow.trim()) {
            errs.targetShow = 'Required';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // حفظ اللاعب والانتقال لخطوة التمارين
    const handleSaveProfile = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!validateStep1()) {
            if (errors.duplicate || (existingAthlete && !isSecondaryAccountAllowed)) {
                showToast('Existing athlete account detected. Choose an action above.', 'error');
            } else {
                showToast('Please fix the indicated form fields', 'error');
            }
            return;
        }

        setIsSubmitting(true);
        try {
            const extraFields = {
                phone: sanitizeString(phone),
                gender,
                age: age ? parseInt(age, 10) : undefined,
                targetWeightKg: parseFloat(targetWeightKg),
                bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
                notes: notes ? sanitizeNotes(notes) : undefined,
                isCompetitor,
                subscription: {
                    planType: subscriptionPlan,
                    durationMonths,
                    startDate,
                    endDate,
                    price: subscriptionPrice ? parseFloat(subscriptionPrice) : undefined,
                    currency: coachSettings?.currency || 'EGP',
                    status: 'active',
                    notes: notes ? sanitizeNotes(notes) : undefined
                },
                competitionProfile: isCompetitor ? {
                    targetShow: sanitizeString(targetShow),
                    showDate: '2026-11-20',
                    division,
                    targetWeightClassKg: parseFloat(targetWeightKg),
                    currentWeightKg: parseFloat(weightKg),
                    prepPhase: 'Prep Phase (16w)',
                    stageReadinessScore: 80,
                    posingApproval: 'Pending Review',
                    daysOut: 56,
                    waterIntakeLiters: 4,
                    carbLoadGrams: 250,
                } : undefined
            };

            const newTrainee = await createTrainee(
                sanitizeString(name),
                email.trim().toLowerCase(),
                goal,
                parseFloat(weightKg),
                parseFloat(heightCm),
                extraFields
            );

            setCreatedAthlete(newTrainee);
            showToast(`Athlete ${newTrainee.name} registered`, 'success');
            setCurrentStep('workout');
        } catch (err) {
            console.error('Failed to create athlete:', err);
            showToast('Could not register athlete. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // الانتقال لاستوديو تصميم التمارين
    const handleOpenSplitsStudio = () => {
        if (!createdAthlete) return;
        const athlete = createdAthlete;
        handleClose();
        if (onNavigateToStudio) onNavigateToStudio(athlete.id);
        else if (onSuccessSelect) onSuccessSelect(athlete.id);
    };

    const handleSkipWorkout = () => {
        setCurrentStep('diet');
    };

    // الانتقال لاستوديو تصميم التغذية
    const handleOpenDietStudio = () => {
        if (!createdAthlete) return;
        const athlete = createdAthlete;
        handleClose();
        if (onNavigateToDietStudio) onNavigateToDietStudio(athlete.id);
        else if (onSuccessSelect) onSuccessSelect(athlete.id);
    };

    // إنهاء الإعداد والذهاب لملف اللاعب
    const handleCompleteSetup = () => {
        if (!createdAthlete) return;
        const athlete = createdAthlete;
        showToast(`Onboarding finished for ${athlete.name}`, 'success');
        handleClose();
        if (onNavigateToClient360) onNavigateToClient360(athlete);
        else if (onSuccessSelect) onSuccessSelect(athlete.id);
    };

    return {
        currentStep,
        setCurrentStep,
        createdAthlete,
        mobileTab,
        setMobileTab,
        isSecondaryAccountAllowed,
        setIsSecondaryAccountAllowed,
        name,
        setName,
        email,
        setEmail,
        phone,
        setPhone,
        gender,
        setGender,
        age,
        setAge,
        weightKg,
        setWeightKg,
        targetWeightKg,
        setTargetWeightKg,
        heightCm,
        setHeightCm,
        bodyFatPercentage,
        setBodyFatPercentage,
        goal,
        notes,
        setNotes,
        isCompetitor,
        setIsCompetitor,
        division,
        setDivision,
        targetShow,
        setTargetShow,
        subscriptionPlan,
        durationMonths,
        startDate,
        endDate,
        setEndDate,
        subscriptionPrice,
        setSubscriptionPrice,
        errors,
        setErrors,
        isSubmitting,
        existingAthlete,
        goalWeightValidation,
        coachSettings,
        handleClose,
        handleGoalChange,
        handleSelectPlanType,
        handleSelectDuration,
        handleStartDateChange,
        handleSaveProfile,
        handleOpenSplitsStudio,
        handleSkipWorkout,
        handleOpenDietStudio,
        handleCompleteSetup
    };
}

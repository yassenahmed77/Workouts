'use client';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { getSavedWeightLogs, saveWeightLog, deleteWeightLog, calculateDynamicWeightChange } from '@/lib/weightEngine';
import { sanitizeString, sanitizeNotes } from '@/lib/sanitizer';
export function useTraineeProfile() {
    const { currentUser, updateUserProfile, getPlanForUser, getDietPlanForUser, getUserLogs, getCheckInsForUser, addCheckIn } = useGym();
    const { showToast } = useToast();
    const fileInputRef = useRef(null);
    // 1. Profile Form State
    const [name, setName] = useState(() => currentUser?.name || '');
    const [phone, setPhone] = useState(() => currentUser?.phone || '');
    const [weightKg, setWeightKg] = useState(() => currentUser?.weightKg || 70);
    const [targetWeightKg, setTargetWeightKg] = useState(() => currentUser?.targetWeightKg || currentUser?.weightKg || 70);
    const [heightCm, setHeightCm] = useState(() => currentUser?.heightCm || 175);
    const [age, setAge] = useState(() => currentUser?.age ? String(currentUser.age) : '');
    const [gender, setGender] = useState(() => currentUser?.gender || 'Male');
    const [bodyFat, setBodyFat] = useState(() => currentUser?.bodyFatPercentage ? String(currentUser.bodyFatPercentage) : '');
    const [avatarUrl, setAvatarUrl] = useState(() => currentUser?.avatarUrl || '');
    const [goal, setGoal] = useState(() => currentUser?.goal || 'Hypertrophy / Muscle Gain');
    const [notes, setNotes] = useState(() => currentUser?.notes || '');
    const [isSaving, setIsSaving] = useState(false);
    // Sync state if currentUser changes
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setPhone(currentUser.phone || '');
            setWeightKg(currentUser.weightKg || 70);
            setTargetWeightKg(currentUser.targetWeightKg || currentUser.weightKg || 70);
            setHeightCm(currentUser.heightCm || 175);
            setAge(currentUser.age ? String(currentUser.age) : '');
            setGender(currentUser.gender || 'Male');
            setBodyFat(currentUser.bodyFatPercentage ? String(currentUser.bodyFatPercentage) : '');
            setAvatarUrl(currentUser.avatarUrl || '');
            setGoal(currentUser.goal || 'Hypertrophy / Muscle Gain');
            setNotes(currentUser.notes || '');
        }
    }, [currentUser]);
    // 2. Check-In & Weigh-In State
    const [weightLogsVersion, setWeightLogsVersion] = useState(0);
    const [newCheckInDate, setNewCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [newCheckInWeight, setNewCheckInWeight] = useState(() => String(currentUser?.weightKg || 70));
    const [newWaistCm, setNewWaistCm] = useState('');
    const [newChestCm, setNewChestCm] = useState('');
    const [newArmsCm, setNewArmsCm] = useState('');
    // 3. Transformation Photo Upload & Gallery State
    const [photoAngle, setPhotoAngle] = useState('front');
    const [selectedPhotoFilter, setSelectedPhotoFilter] = useState('all');
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isAllPhotosModalOpen, setIsAllPhotosModalOpen] = useState(false);
    const [allPhotosFilter, setAllPhotosFilter] = useState('all');
    const [lightboxPhoto, setLightboxPhoto] = useState(null);
    // 4. Diet Modal State
    const [showDietModal, setShowDietModal] = useState(false);
    // 5. Memoized Core Collections
    const logs = useMemo(() => (currentUser ? getUserLogs(currentUser.id) : []), [currentUser, getUserLogs]);
    const plan = useMemo(() => (currentUser ? getPlanForUser(currentUser.id) : undefined), [currentUser, getPlanForUser]);
    const dietPlan = useMemo(() => (currentUser ? getDietPlanForUser(currentUser.id) : null), [currentUser, getDietPlanForUser]);
    const checkIns = useMemo(() => (currentUser ? getCheckInsForUser(currentUser.id) : []), [currentUser, getCheckInsForUser, weightLogsVersion]);
    const weightLogs = useMemo(() => {
        if (!currentUser?.id)
            return [];
        return getSavedWeightLogs(currentUser.id);
    }, [currentUser?.id, weightLogsVersion]);
    // Escape key listener for open modals
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsAllPhotosModalOpen(false);
                setLightboxPhoto(null);
                setShowDietModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    // Weight Analysis
    const weightAnalysis = useMemo(() => {
        return calculateDynamicWeightChange(weightLogs, currentUser?.weightKg || 70);
    }, [weightLogs, currentUser?.weightKg]);
    // Chronologically flattened photos archive across all check-ins
    const allPhotos = useMemo(() => {
        return checkIns
            .flatMap((chk) => (chk.photos || []).map((p) => ({
            ...p,
            checkInDate: chk.date,
            weightKg: chk.weightKg
        })))
            .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
    }, [checkIns]);
    const filteredPhotos = useMemo(() => {
        return selectedPhotoFilter === 'all'
            ? allPhotos
            : allPhotos.filter((p) => p.angle === selectedPhotoFilter);
    }, [allPhotos, selectedPhotoFilter]);
    const modalFilteredPhotos = useMemo(() => {
        return allPhotosFilter === 'all'
            ? allPhotos
            : allPhotos.filter((p) => p.angle === allPhotosFilter);
    }, [allPhotos, allPhotosFilter]);
    // 6. Action Handlers (Defensively Validated & Sanitized)
    const handleSaveProfile = useCallback(async (e) => {
        e.preventDefault();
        if (!currentUser)
            return;
        const cleanName = sanitizeString(name);
        if (!cleanName) {
            showToast('Name cannot be empty', 'error');
            return;
        }
        const parsedWeight = parseFloat(String(weightKg));
        if (isNaN(parsedWeight) || parsedWeight < 30 || parsedWeight > 300) {
            showToast('Please enter a valid weight (30 - 300 kg)', 'error');
            return;
        }
        const parsedTarget = parseFloat(String(targetWeightKg));
        if (isNaN(parsedTarget) || parsedTarget < 30 || parsedTarget > 300) {
            showToast('Please enter a valid target weight (30 - 300 kg)', 'error');
            return;
        }
        const parsedHeight = parseInt(String(heightCm));
        if (isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 260) {
            showToast('Please enter a valid height (50 - 260 cm)', 'error');
            return;
        }
        const parsedAge = age ? parseInt(age) : undefined;
        if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120)) {
            showToast('Please enter a valid age (10 - 120)', 'error');
            return;
        }
        const parsedBodyFat = bodyFat ? parseFloat(bodyFat) : undefined;
        if (parsedBodyFat !== undefined && (isNaN(parsedBodyFat) || parsedBodyFat < 2 || parsedBodyFat > 65)) {
            showToast('Please enter a valid body fat % (2 - 65%)', 'error');
            return;
        }
        setIsSaving(true);
        await updateUserProfile(currentUser.id, {
            name: cleanName,
            phone: sanitizeString(phone),
            weightKg: parsedWeight,
            targetWeightKg: parsedTarget,
            heightCm: parsedHeight,
            age: parsedAge,
            gender,
            bodyFatPercentage: parsedBodyFat,
            goal,
            notes: sanitizeNotes(notes),
            avatarUrl: sanitizeString(avatarUrl) || undefined
        });
        // If current weight changed, save a new log point so progression curves update
        if (parsedWeight !== currentUser.weightKg) {
            saveWeightLog(currentUser.id, parsedWeight, new Date().toISOString().split('T')[0]);
            setWeightLogsVersion((v) => v + 1);
        }
        setIsSaving(false);
        showToast('Profile directives saved', 'success');
    }, [
        currentUser,
        name,
        phone,
        weightKg,
        targetWeightKg,
        heightCm,
        age,
        gender,
        bodyFat,
        goal,
        notes,
        avatarUrl,
        updateUserProfile,
        showToast
    ]);
    const handleLogWeighIn = useCallback(async (e) => {
        e.preventDefault();
        if (!currentUser)
            return;
        const val = parseFloat(newCheckInWeight);
        if (isNaN(val) || val <= 30 || val >= 300) {
            showToast('Please enter a valid weight (30 - 300 kg)', 'error');
            return;
        }
        saveWeightLog(currentUser.id, val, newCheckInDate);
        await addCheckIn({
            userId: currentUser.id,
            date: newCheckInDate,
            weightKg: val,
            inBody: {
                bodyFatPct: currentUser.bodyFatPercentage ? Number(currentUser.bodyFatPercentage) : undefined
            },
            photos: [],
            reviewed: false,
            traineeNotes: `Weight logged: ${val} kg`
        });
        setWeightKg(val);
        setWeightLogsVersion((v) => v + 1);
        setNewWaistCm('');
        setNewChestCm('');
        setNewArmsCm('');
        showToast(`Check-in logged: ${val} kg`, 'success');
    }, [currentUser, newCheckInWeight, newCheckInDate, newWaistCm, newChestCm, newArmsCm, addCheckIn, showToast]);
    const handleDeleteWeight = useCallback((logId) => {
        if (!currentUser)
            return;
        deleteWeightLog(currentUser.id, logId);
        setWeightLogsVersion((v) => v + 1);
        showToast('Check-in removed', 'info');
    }, [currentUser, showToast]);
    const handlePhotoSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (!file.type.startsWith('image/')) {
            showToast('Please upload a valid image file', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('Photo must be smaller than 5MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    }, [showToast]);
    const handleSavePhotoCheckIn = useCallback(async () => {
        if (!currentUser || !photoPreview)
            return;
        setIsUploadingPhoto(true);
        const photoItem = {
            id: `photo-${Date.now()}`,
            url: photoPreview,
            angle: photoAngle,
            date: newCheckInDate
        };
        await addCheckIn({
            userId: currentUser.id,
            date: newCheckInDate,
            weightKg: Number(weightKg),
            measurements: {},
            photos: [photoItem],
            reviewed: false,
            traineeNotes: `Uploaded ${photoAngle} transformation photo`
        });
        setPhotoPreview(null);
        if (fileInputRef.current)
            fileInputRef.current.value = '';
        setWeightLogsVersion((v) => v + 1);
        setIsUploadingPhoto(false);
        showToast('Transformation photo added to timeline', 'success');
    }, [currentUser, photoPreview, photoAngle, newCheckInDate, weightKg, addCheckIn, showToast]);
    return {
        currentUser,
        logs,
        plan,
        dietPlan,
        weightLogs,
        weightAnalysis,
        allPhotos,
        filteredPhotos,
        modalFilteredPhotos,
        fileInputRef,
        // Profile form state
        name,
        setName,
        phone,
        setPhone,
        weightKg,
        setWeightKg,
        targetWeightKg,
        setTargetWeightKg,
        heightCm,
        setHeightCm,
        age,
        setAge,
        gender,
        setGender,
        bodyFat,
        setBodyFat,
        avatarUrl,
        setAvatarUrl,
        goal,
        setGoal,
        notes,
        setNotes,
        isSaving,
        // Check-in state
        newCheckInDate,
        setNewCheckInDate,
        newCheckInWeight,
        setNewCheckInWeight,
        newWaistCm,
        setNewWaistCm,
        newChestCm,
        setNewChestCm,
        newArmsCm,
        setNewArmsCm,
        // Photo state
        photoAngle,
        setPhotoAngle,
        selectedPhotoFilter,
        setSelectedPhotoFilter,
        photoPreview,
        setPhotoPreview,
        isUploadingPhoto,
        isAllPhotosModalOpen,
        setIsAllPhotosModalOpen,
        allPhotosFilter,
        setAllPhotosFilter,
        lightboxPhoto,
        setLightboxPhoto,
        // Diet modal
        showDietModal,
        setShowDietModal,
        // Handlers
        handleSaveProfile,
        handleLogWeighIn,
        handleDeleteWeight,
        handlePhotoSelect,
        handleSavePhotoCheckIn
    };
}

'use client';
import React from 'react';
import { useTraineeProfile } from '@/hooks/useTraineeProfile';
import { ProfileHeroHeader, ProfileBiometricsStrip, PhysiqueTimelineSection, WeeklyCheckInHistorySection, AccountConfigForm, AssignedPlansSection, AllPhotosArchiveModal, PhotoLightboxModal } from './profile';
import { FullDietModal } from './dashboard/FullDietModal';
export const TraineeProfileView = ({ onNavigateToWorkouts, onNavigateToDiet }) => {
    const profile = useTraineeProfile();
    if (!profile.currentUser)
        return null;
    return (<div className="w-full max-w-4xl mx-auto space-y-3.5 pb-24 md:pb-12 select-none">
      {/* 1. Athlete Hero Header */}
      <ProfileHeroHeader user={profile.currentUser}/>

      {/* 2. Biometrics 3-Column Strip (Aligned Baselines) */}
      <ProfileBiometricsStrip currentWeightKg={profile.weightAnalysis.currentWeightKg} statusText={profile.weightAnalysis.statusText} targetWeightKg={Number(profile.targetWeightKg)} goal={profile.goal}/>

      {/* 3. Visual Transformation Timeline & Photos */}
      <PhysiqueTimelineSection photos={profile.filteredPhotos} allPhotosCount={profile.allPhotos.length} selectedFilter={profile.selectedPhotoFilter} onFilterChange={profile.setSelectedPhotoFilter} onOpenAllPhotosModal={() => profile.setIsAllPhotosModalOpen(true)} onPhotoClick={(p) => profile.setLightboxPhoto({ url: p.url, date: p.checkInDate, angle: p.angle, weightKg: p.weightKg })} fileInputRef={profile.fileInputRef} photoAngle={profile.photoAngle} onAngleChange={profile.setPhotoAngle} photoPreview={profile.photoPreview} isUploading={profile.isUploadingPhoto} onPhotoSelect={profile.handlePhotoSelect} onSavePhoto={profile.handleSavePhotoCheckIn} onDiscardPreview={() => profile.setPhotoPreview(null)} currentCheckInDate={profile.newCheckInDate}/>

      {/* 4. Weekly Weigh-In & Circumference Logs */}
      <WeeklyCheckInHistorySection totalNetDeltaKg={profile.weightAnalysis.totalNetDeltaKg} date={profile.newCheckInDate} onDateChange={profile.setNewCheckInDate} weight={profile.newCheckInWeight} onWeightChange={profile.setNewCheckInWeight} waistCm={profile.newWaistCm} onWaistCmChange={profile.setNewWaistCm} chestCm={profile.newChestCm} onChestCmChange={profile.setNewChestCm} onSubmit={profile.handleLogWeighIn} weightLogs={profile.weightLogs} onDeleteWeight={profile.handleDeleteWeight}/>

      {/* 5. Account Config Directives (All Editable Biometrics & Demographics) */}
      <AccountConfigForm name={profile.name} onNameChange={profile.setName} email={profile.currentUser.email} phone={profile.phone} onPhoneChange={profile.setPhone} weightKg={profile.weightKg} onWeightKgChange={profile.setWeightKg} targetWeightKg={profile.targetWeightKg} onTargetWeightKgChange={profile.setTargetWeightKg} heightCm={profile.heightCm} onHeightCmChange={profile.setHeightCm} age={profile.age} onAgeChange={profile.setAge} gender={profile.gender} onGenderChange={profile.setGender} bodyFat={profile.bodyFat} onBodyFatChange={profile.setBodyFat} avatarUrl={profile.avatarUrl} onAvatarUrlChange={profile.setAvatarUrl} goal={profile.goal} onGoalChange={profile.setGoal} notes={profile.notes} onNotesChange={profile.setNotes} isSaving={profile.isSaving} onSubmit={profile.handleSaveProfile}/>

      {/* 6. Assigned Workout & Nutrition Plans */}
      <AssignedPlansSection plan={profile.plan} dietPlan={profile.dietPlan} logsCount={profile.logs.length} onNavigateToWorkouts={onNavigateToWorkouts} onOpenDietModal={() => {
            if (onNavigateToDiet) {
                onNavigateToDiet();
            }
            else {
                profile.setShowDietModal(true);
            }
        }}/>

      {/* 7. All Photos Timeline Archive Modal */}
      <AllPhotosArchiveModal isOpen={profile.isAllPhotosModalOpen} onClose={() => profile.setIsAllPhotosModalOpen(false)} photos={profile.modalFilteredPhotos} allPhotosCount={profile.allPhotos.length} filter={profile.allPhotosFilter} onFilterChange={profile.setAllPhotosFilter} onPhotoClick={(p) => profile.setLightboxPhoto({ url: p.url, date: p.checkInDate, angle: p.angle, weightKg: p.weightKg })}/>

      {/* 8. Photo Lightbox Modal */}
      <PhotoLightboxModal photo={profile.lightboxPhoto} onClose={() => profile.setLightboxPhoto(null)}/>

      {/* 9. Full Diet Modal */}
      <FullDietModal isOpen={profile.showDietModal} dietPlan={profile.dietPlan} meals={profile.dietPlan?.meals || []} onClose={() => profile.setShowDietModal(false)}/>
    </div>);
};

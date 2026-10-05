'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, MuscleGroup } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { 
  Camera, 
  Upload, 
  Video, 
  StopCircle, 
  RotateCcw, 
  Check, 
  Dumbbell, 
  Layers, 
  AlertCircle,
  FileVideo
} from 'lucide-react';

interface RecordFormCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: User;
}

const COMMON_EXERCISES: { name: string; target: MuscleGroup }[] = [
  { name: 'Barbell Squat', target: 'Quads' },
  { name: 'Romanian Deadlift', target: 'Hamstrings' },
  { name: 'Barbell Bench Press', target: 'Chest' },
  { name: 'Incline Bench Press', target: 'Chest' },
  { name: 'Overhead Barbell Press', target: 'Shoulders' },
  { name: 'Lat Pulldown', target: 'Back' },
  { name: 'Seated Cable Row', target: 'Back' },
  { name: 'Dumbbell Lateral Raise', target: 'Shoulders' },
  { name: 'Lying Leg Curl', target: 'Hamstrings' },
  { name: 'Leg Extension', target: 'Quads' }
];

export const RecordFormCheckModal: React.FC<RecordFormCheckModalProps> = ({
  isOpen,
  onClose,
  client
}) => {
  const { addFormCheckVideo, getPlanForUser } = useGym();
  const { showToast } = useToast();

  const [activeMode, setActiveMode] = useState<'upload' | 'record'>('upload');
  const [selectedExercise, setSelectedExercise] = useState('Barbell Squat');
  const [customExercise, setCustomExercise] = useState('');
  const [targetMuscle, setTargetMuscle] = useState<MuscleGroup>('Quads');
  const [setDetails, setSetDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic exercises from athlete's current plan
  const athletePlan = getPlanForUser(client.id);
  const planExercises = React.useMemo(() => {
    if (!athletePlan) return [];
    const set = new Map<string, MuscleGroup>();
    athletePlan.days.forEach((d) => {
      d.exercises.forEach((ex) => {
        set.set(ex.exerciseName, ex.targetMuscle);
      });
    });
    return Array.from(set.entries()).map(([name, target]) => ({ name, target }));
  }, [athletePlan]);

  const availableExercises = planExercises.length > 0 ? planExercises : COMMON_EXERCISES;

  // Cleanup camera stream when modal closes or mode switches
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setVideoUrl(null);
      setSetDetails('');
      setNotes('');
      setRecordSeconds(0);
      setCameraError(null);
    }
  }, [isOpen]);

  // Start camera when entering 'record' mode
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      mediaStreamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access unavailable or denied. You can still upload a video file directly.');
      setActiveMode('upload');
    }
  };

  const handleModeChange = (mode: 'upload' | 'record') => {
    setActiveMode(mode);
    if (mode === 'record') {
      startCamera();
    } else {
      stopCameraStream();
    }
  };

  // Start live recording
  const handleStartRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    try {
      const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? { mimeType: 'video/webm;codecs=vp9' }
        : { mimeType: 'video/webm' };
      const recorder = new MediaRecorder(mediaStreamRef.current, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        stopCameraStream();
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      showToast('Recording failed to start on this browser', 'error');
    }
  };

  // Stop live recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    showToast(`Video loaded (${(file.size / (1024 * 1024)).toFixed(1)} MB)`, 'info');
  };

  const handleSelectExercise = (exName: string) => {
    setSelectedExercise(exName);
    const found = availableExercises.find((ex) => ex.name === exName);
    if (found) {
      setTargetMuscle(found.target);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalExerciseName = selectedExercise === 'custom' ? customExercise.trim() : selectedExercise;
    if (!finalExerciseName) {
      showToast('Please select or specify an exercise', 'error');
      return;
    }

    if (!videoUrl) {
      showToast('Please record or upload a video first', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addFormCheckVideo({
        userId: client.id,
        exerciseName: finalExerciseName,
        targetMuscle,
        videoUrl,
        setDetails: setDetails.trim() || undefined,
        notes: notes.trim() || undefined,
        status: 'pending'
      });
      showToast('Form check video recorded & submitted!', 'success');
      onClose();
    } catch {
      showToast('Failed to save video', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCameraStream();
        onClose();
      }}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <Video className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">
              Record &amp; Upload Form Check Video
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Athlete: {client.name} &bull; Check Execution &amp; Technique
            </span>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black border border-white/10">
          <button
            type="button"
            onClick={() => handleModeChange('upload')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-white text-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Video File</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('record')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'record'
                ? 'bg-white text-black shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Record Live with Camera</span>
          </button>
        </div>

        {cameraError && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Video Capture & Preview Zone */}
        <div className="rounded-xl overflow-hidden bg-black border border-white/10 relative min-h-[220px] max-h-[300px] flex items-center justify-center">
          {videoUrl ? (
            // Recorded / Uploaded Video Preview
            <div className="w-full h-full relative">
              <video
                src={videoUrl}
                controls
                playsInline
                className="w-full max-h-[280px] object-contain bg-black"
              />
              <button
                type="button"
                onClick={() => {
                  setVideoUrl(null);
                  if (activeMode === 'record') startCamera();
                }}
                className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/80 hover:bg-black border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1 shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake / Change</span>
              </button>
            </div>
          ) : activeMode === 'record' ? (
            // Live Camera Viewfinder
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              <video
                ref={liveVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[280px] object-cover"
              />

              {/* Recording status badge */}
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/90 text-white font-mono text-xs font-bold animate-pulse shadow">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>REC {formatSeconds(recordSeconds)}</span>
                </div>
              )}

              {/* Record / Stop Action Button */}
              <div className="absolute bottom-4 flex items-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-white" />
                    <span>Start Recording Lift</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-4 py-2 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <StopCircle className="w-4 h-4 text-red-600" />
                    <span>Stop &amp; Review</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            // File Upload Drop Area
            <label className="w-full h-full p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors">
              <input
                type="file"
                accept="video/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-white block">
                  Select or drop exercise video
                </span>
                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                  Supports MP4, MOV, WebM (up to 100MB)
                </span>
              </div>
              <span className="px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-semibold text-slate-200">
                Browse Video Files
              </span>
            </label>
          )}
        </div>

        {/* Form Details: Exercise Selection, Sets/Reps, Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Exercise Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Exercise Name *
            </label>
            <select
              value={selectedExercise}
              onChange={(e) => handleSelectExercise(e.target.value)}
              className="w-full p-2 rounded-lg bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
            >
              {availableExercises.map((ex) => (
                <option key={ex.name} value={ex.name} className="bg-[#090d14] text-white">
                  {ex.name} ({ex.target})
                </option>
              ))}
              <option value="custom" className="bg-[#090d14] text-cyan-400">
                + Other / Custom Exercise...
              </option>
            </select>

            {selectedExercise === 'custom' && (
              <input
                type="text"
                value={customExercise}
                onChange={(e) => setCustomExercise(e.target.value)}
                placeholder="Type exercise name..."
                className="w-full p-2 mt-1 rounded-lg bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            )}
          </div>

          {/* Sets, Load & Reps */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Set &amp; Load Details
            </label>
            <input
              type="text"
              value={setDetails}
              onChange={(e) => setSetDetails(e.target.value)}
              placeholder="e.g. Set 3 • 120 kg × 6 reps"
              className="w-full p-2 rounded-lg bg-black border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Athlete Notes */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
            Athlete Notes &amp; Specific Check Requests
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Did I hit parallel on the 4th rep? Felt my right knee caving slightly..."
            className="w-full p-2 rounded-lg bg-black border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-sans"
          />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!videoUrl || isSubmitting}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 text-black font-bold text-xs inline-flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Save Form Check Video</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

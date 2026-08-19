import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  Maximize2
} from 'lucide-react';
import {
  Milestone,
  MilestoneSubmission,
  UserProfile,
  Language,
  GeoLocationData,
  CompressionResult
} from '../types';
import { translations } from '../translations';
import { getCurrentLocation } from '../services/geolocationService';
import { compressAndWatermarkMilestoneWork } from '../utils/imageCompressor';

interface MilestoneSubmissionModalProps {
  milestone: Milestone;
  user: UserProfile;
  language: Language;
  onClose: () => void;
  onSubmit: (submission: MilestoneSubmission, photoBlob: Blob) => Promise<void>;
}

export const MilestoneSubmissionModal: React.FC<MilestoneSubmissionModalProps> = ({
  milestone,
  user,
  language,
  onClose,
  onSubmit
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawPhoto, setRawPhoto] = useState<File | Blob | null>(null);
  const [location, setLocation] = useState<GeoLocationData | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'loading' | 'success' | 'fallback'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Rear-Webcam fallback state
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // 1. Acquire GPS coordinates immediately
  useEffect(() => {
    let isMounted = true;

    async function fetchGps() {
      try {
        const loc = await getCurrentLocation();
        if (isMounted) {
          setLocation(loc);
          setGpsStatus(loc.isSimulated ? 'fallback' : 'success');
        }
      } catch (e) {
        if (isMounted) {
          setGpsStatus('fallback');
        }
      }
    }

    fetchGps();
    return () => {
      isMounted = false;
      stopVideoStream();
    };
  }, []);

  const stopVideoStream = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((t) => t.stop());
      setVideoStream(null);
    }
  };

  // Launch rear camera file input
  const handleLaunchCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle hardware camera file capture
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation: check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please capture a valid image photo of the completed electrical work.');
      return;
    }

    setRawPhoto(file);
    await processCapturedImage(file);
  };

  // Live In-App Camera stream start
  const handleStartLiveRearCamera = async () => {
    try {
      setError(null);
      setIsLiveCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Rear camera stream failed, fallback to native camera prompt:', err);
      setIsLiveCameraActive(false);
      handleLaunchCamera();
    }
  };

  // Snap live camera
  const handleSnapLiveCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        stopVideoStream();
        setIsLiveCameraActive(false);
        setRawPhoto(blob);
        await processCapturedImage(blob);
      }
    }, 'image/jpeg', 0.95);
  };

  // Process, Watermark & Compress using utils/imageCompressor.ts
  const processCapturedImage = async (source: File | Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Re-check location or use fallback
      let currentLoc = location;
      if (!currentLoc) {
        currentLoc = await getCurrentLocation();
        setLocation(currentLoc);
      }

      const result = await compressAndWatermarkMilestoneWork(source, {
        workerName: user.name,
        workerId: user.workerId,
        substation: user.substation,
        milestoneTitle: milestone.title,
        stepOrder: milestone.stepOrder,
        location: currentLoc,
        timestamp: new Date(),
        quality: 0.75
      });

      setCompressionResult(result);
    } catch (err: any) {
      console.error('Milestone image processing error:', err);
      setError('Failed to watermark and compress image. Please retake photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and submit
  const handleConfirmSubmit = async () => {
    if (!compressionResult || !location) return;

    setIsSubmitting(true);
    try {
      const submissionId = `sub_${milestone.id}_${Date.now()}`;
      const now = new Date();
      const submission: MilestoneSubmission = {
        id: submissionId,
        milestoneId: milestone.id,
        workerId: user.workerId,
        workerName: user.name,
        workerPhone: user.phone,
        substation: user.substation,
        submittedAt: now.toISOString(),
        dateFormatted: now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        timeFormatted: now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        submittedImageUrl: compressionResult.compressedDataUrl,
        compressedSizeKb: compressionResult.compressedSizeKb,
        location: location,
        status: 'pending', // Submitted - Under Review
        syncStatus: 'pending'
      };

      await onSubmit(submission, compressionResult.blob);
      onClose();
    } catch (e: any) {
      setError('Failed to submit milestone work. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Hidden Strict Environment Rear Camera Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-[#0052cc] border border-blue-200">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {t.milestoneStep.replace('{step}', String(milestone.stepOrder))}
              </div>
              <h3 className="text-sm font-bold text-gray-900 truncate max-w-[280px]">
                {language === 'hi' ? milestone.titleHi : milestone.title}
              </h3>
            </div>
          </div>

          <button
            id="close-milestone-submit-modal"
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* GPS Satellite Lock Status */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin
                className={`w-4 h-4 ${
                  gpsStatus === 'success' ? 'text-green-600' : 'text-orange-500'
                }`}
              />
              <div className="text-xs">
                <div className="font-bold text-gray-900">
                  {gpsStatus === 'success'
                    ? `GPS Locked (±${Math.round(location?.accuracy || 5)}m)`
                    : 'Acquiring GPS Satellite Lock...'}
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {location
                    ? `${location.latitude.toFixed(5)}° N, ${location.longitude.toFixed(5)}° E`
                    : 'Scanning GNSS satellites...'}
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0052cc] border border-blue-200">
              REAR CAM ONLY
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Live In-App Rear Camera Viewfinder */}
          {isLiveCameraActive ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-gray-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/40 m-4 rounded-xl pointer-events-none" />
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <button
                  type="button"
                  onClick={handleSnapLiveCamera}
                  className="px-6 py-2.5 rounded-full bg-[#0052cc] hover:bg-[#0041a3] text-white font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center space-x-2 border-2 border-white"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Work Photo</span>
                </button>
              </div>
            </div>
          ) : !compressionResult ? (
            /* Camera Launch Trigger Card */
            <div className="p-6 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0052cc] flex items-center justify-center shadow-xs border border-blue-200">
                <Camera className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {t.rearCameraOnly}
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  {t.noGalleryNote}
                </p>
              </div>

              <div className="w-full space-y-2 pt-2">
                <button
                  id="launch-native-rear-cam-btn"
                  type="button"
                  onClick={handleLaunchCamera}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-[#0052cc] hover:bg-[#0041a3] active:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Launch Rear Camera</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStartLiveRearCamera}
                  className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-2xl border border-gray-200 flex items-center justify-center space-x-2 transition-colors"
                >
                  <span>Use In-App Viewfinder</span>
                </button>
              </div>
            </div>
          ) : (
            /* Watermarked Preview & Compression Metrics */
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 shadow-md">
                <img
                  src={compressionResult.compressedDataUrl}
                  alt="Watermarked Milestone Work"
                  className="w-full h-auto max-h-[340px] object-contain mx-auto"
                />
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  <span>WATERMARKED</span>
                </div>
              </div>

              {/* Compression Metric Pills */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Original</div>
                  <div className="text-xs font-black text-gray-900 font-mono mt-0.5">
                    {compressionResult.originalSizeKb} KB
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                  <div className="text-[10px] text-blue-700 uppercase font-bold">Compressed</div>
                  <div className="text-xs font-black text-[#0052cc] font-mono mt-0.5">
                    {compressionResult.compressedSizeKb} KB
                  </div>
                </div>

                <div className="p-2.5 bg-green-50 rounded-2xl border border-green-200 text-center">
                  <div className="text-[10px] text-green-700 uppercase font-bold">Saved</div>
                  <div className="text-xs font-black text-green-700 font-mono mt-0.5">
                    {compressionResult.compressionRatio}%
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 text-center flex items-center justify-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-[#0052cc]" />
                <span>Optimized for fast 3G upload & offline queueing</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between space-x-3">
          {compressionResult ? (
            <>
              <button
                type="button"
                onClick={handleLaunchCamera}
                disabled={isSubmitting}
                className="px-4 py-3 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors"
              >
                {t.retakePhoto}
              </button>

              <button
                id="confirm-milestone-submission-btn"
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#0052cc] hover:bg-[#0041a3] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.confirmMilestoneSubmit}</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition-colors"
              >
                {t.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

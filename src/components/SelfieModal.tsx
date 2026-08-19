import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  X,
  Gauge
} from 'lucide-react';
import { UserProfile, GeoLocationData, CompressionResult, AttendanceRecord, Language } from '../types';
import { translations } from '../translations';
import { compressAndWatermarkImage } from '../services/imageCompression';
import { getAccurateGeolocation } from '../services/geolocationService';

interface SelfieModalProps {
  user: UserProfile;
  language: Language;
  photoSource: File | Blob | string;
  attendanceType: 'CHECK_IN' | 'CHECK_OUT';
  onClose: () => void;
  onSubmit: (record: AttendanceRecord, photoBlob: Blob) => void;
}

export const SelfieModal: React.FC<SelfieModalProps> = ({
  user,
  language,
  photoSource,
  attendanceType,
  onClose,
  onSubmit
}) => {
  const t = translations[language];

  const [isProcessing, setIsProcessing] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'fallback'>('acquiring');
  const [location, setLocation] = useState<GeoLocationData | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function processCapture() {
      setIsProcessing(true);
      setError(null);

      try {
        // 1. Get High-Accuracy GPS Coordinates
        const loc = await getAccurateGeolocation();
        if (isCancelled) return;

        setLocation(loc);
        setGpsStatus(loc.isSimulated ? 'fallback' : 'locked');

        // 2. Compress image and burn watermarked bar with Date, Time, Lat, Long, Worker ID
        const now = new Date();
        const result = await compressAndWatermarkImage(photoSource, {
          workerName: user.name,
          workerId: user.workerId,
          substation: user.substation,
          location: loc,
          timestamp: now,
          type: attendanceType
        });

        if (isCancelled) return;
        setCompressionResult(result);
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Processing error:', err);
          setError(err.message || 'Failed to process selfie');
        }
      } finally {
        if (!isCancelled) {
          setIsProcessing(false);
        }
      }
    }

    processCapture();

    return () => {
      isCancelled = true;
    };
  }, [photoSource, user, attendanceType]);

  const handleConfirm = () => {
    if (!compressionResult || !location) return;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      workerId: user.workerId,
      workerName: user.name,
      workerPhone: user.phone,
      substation: user.substation,
      timestamp: now.toISOString(),
      dateFormatted,
      timeFormatted,
      type: attendanceType,
      photoDataUrl: compressionResult.compressedDataUrl,
      originalSizeKb: compressionResult.originalSizeKb,
      compressedSizeKb: compressionResult.compressedSizeKb,
      compressionRatio: compressionResult.compressionRatio,
      location: location,
      watermarked: true,
      syncStatus: 'pending'
    };

    onSubmit(newRecord, compressionResult.blob);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${attendanceType === 'CHECK_IN' ? 'bg-[#22c55e]' : 'bg-[#0052cc]'}`} />
            <h3 className="font-bold text-gray-900 text-base">
              {t.photoPreviewTitle}
            </h3>
          </div>
          <button
            id="close-selfie-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {isProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-[#0052cc] animate-spin" />
                <Zap className="w-7 h-7 text-[#0052cc] absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  {t.submitting}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {gpsStatus === 'acquiring' ? t.gpsAcquiring : t.burnWatermarkInfo}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-[#0052cc] font-mono bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                <Gauge className="w-4 h-4 text-[#0052cc] animate-pulse" />
                <span>Canvas Resizing (Max 1080px) & 70% JPEG Compression</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Processing Error</span>
              </div>
              <p>{error}</p>
              <button
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs"
              >
                {t.retakePhoto}
              </button>
            </div>
          ) : compressionResult ? (
            <>
              {/* Image Preview with Embedded Watermark */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black shadow-inner">
                <img
                  src={compressionResult.compressedDataUrl}
                  alt="Watermarked Attendance Selfie"
                  className="w-full h-auto max-h-[340px] object-contain mx-auto"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[11px] font-bold text-green-700 border border-green-200 flex items-center space-x-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Watermarked & Geo-Tagged</span>
                </div>
              </div>

              {/* Compression Metric Pills (Low 3G Optimization Proof) */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <div className="text-[10px] text-gray-500 uppercase font-sans font-bold">
                    {t.originalSize}
                  </div>
                  <div className="text-sm font-bold text-gray-800">
                    {compressionResult.originalSizeKb} KB
                  </div>
                </div>
                <div className="bg-green-50 p-2.5 rounded-xl border border-green-200">
                  <div className="text-[10px] text-green-700 uppercase font-sans font-bold">
                    {t.compressedSize}
                  </div>
                  <div className="text-sm font-bold text-green-800">
                    {compressionResult.compressedSizeKb} KB
                  </div>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                  <div className="text-[10px] text-[#0052cc] uppercase font-sans font-bold">
                    {t.savedData}
                  </div>
                  <div className="text-sm font-black text-[#0052cc]">
                    +{compressionResult.compressionRatio}%
                  </div>
                </div>
              </div>

              {/* Location & GPS Info */}
              {location && (
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-red-500" />
                      <span>GPS Coordinates</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                      ±{Math.round(location.accuracy)}m {t.accuracy}
                    </span>
                  </div>
                  <div className="font-mono text-[#0052cc] font-bold text-[11px]">
                    {location.latitude.toFixed(6)}° N, {location.longitude.toFixed(6)}° E
                  </div>
                  <div className="text-gray-600 text-[11px] truncate">
                    {location.address}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center space-x-3">
          <button
            id="retake-selfie-btn"
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-1/3 h-13 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-bold text-xs uppercase rounded-xl border border-gray-300 transition-colors disabled:opacity-50"
          >
            {t.retakePhoto}
          </button>

          <button
            id="confirm-attendance-btn"
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !compressionResult}
            className="w-2/3 h-13 bg-[#22c55e] hover:bg-green-600 active:bg-green-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-green-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t.confirmAttendance}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

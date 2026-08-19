import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, FlipHorizontal, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface LiveWebcamModalProps {
  language: Language;
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export const LiveWebcamModal: React.FC<LiveWebcamModalProps> = ({
  language,
  onCapture,
  onClose
}) => {
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      setIsReady(false);
      setError(null);

      // Stop previous tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
              setIsReady(true);
            }
          };
        }
      } catch (err: any) {
        if (active) {
          console.error('Camera stream error:', err);
          setError(t.cameraError);
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, t.cameraError]);

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front camera for natural mirror feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleToggleFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-3 sm:p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="text-white font-bold text-sm flex items-center space-x-2">
          <Camera className="w-5 h-5 text-[#0052cc]" />
          <span>{facingMode === 'user' ? 'Front Camera (Selfie)' : 'Back Camera'}</span>
        </div>
        <button
          id="close-webcam-modal-btn"
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Video Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden rounded-3xl bg-black border border-white/20 shadow-2xl">
        {error ? (
          <div className="p-6 text-center text-red-300 max-w-xs">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-400" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            {/* Guide Overlay for Electrician Face alignment */}
            <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-3xl pointer-events-none m-6" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl text-center text-xs text-gray-900 font-semibold shadow-md">
              ⚡ Align face clearly with helmet/uniform in good light
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-around py-3 z-10">
        <button
          id="flip-camera-btn"
          type="button"
          onClick={handleToggleFacing}
          className="p-3.5 rounded-full bg-white/20 text-white hover:bg-white/30 active:bg-white/40 transition-colors"
          title={t.switchCamera}
        >
          <FlipHorizontal className="w-6 h-6" />
        </button>

        <button
          id="capture-snap-btn"
          type="button"
          onClick={handleTakeSnapshot}
          disabled={!isReady}
          className="w-20 h-20 rounded-full bg-white hover:bg-gray-100 active:scale-95 border-4 border-[#0052cc] shadow-2xl flex items-center justify-center transition-all disabled:opacity-40"
          title={t.capturePhoto}
        >
          <div className="w-14 h-14 rounded-full bg-[#0052cc]" />
        </button>

        <div className="w-12" /> {/* Spacer */}
      </div>
    </div>
  );
};

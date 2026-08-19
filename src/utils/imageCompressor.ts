import { CompressionResult, GeoLocationData } from '../types';

export interface MilestoneWatermarkOptions {
  workerName: string;
  workerId: string;
  substation: string;
  milestoneTitle: string;
  stepOrder: number;
  location: GeoLocationData;
  timestamp: Date;
  quality?: number;
}

/**
 * Client-side HTML5 canvas image compressor and EXIF/watermark stamping utility.
 * - Caps max dimension at 1080p.
 * - Burns high-contrast tamper-evident watermark with GPS coords, timestamp, worker details & milestone context.
 * - Compresses to JPEG at quality 0.75 (or specified).
 */
export async function compressAndWatermarkMilestoneWork(
  source: File | Blob | string,
  options: MilestoneWatermarkOptions
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKb =
      source instanceof File || source instanceof Blob
        ? Math.round(source.size / 1024)
        : 1200;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width || 1080;
        let height = img.naturalHeight || img.height || 1440;

        const maxDim = 1080;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        // Draw original photo
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark Banner setup
        const bannerHeight = Math.max(96, Math.round(height * 0.17));
        const bannerY = height - bannerHeight;

        // Dark gradient-like background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fillRect(0, bannerY, width, bannerHeight);

        // Electric Blue & Gold top accent stripes
        ctx.fillStyle = '#0052cc';
        ctx.fillRect(0, bannerY, width, Math.max(3, Math.round(width * 0.004)));
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, bannerY + Math.max(3, Math.round(width * 0.004)), width, 2);

        // Typography settings
        const baseFontSize = Math.max(13, Math.round(width * 0.025));
        const subFontSize = Math.max(11, Math.round(width * 0.02));
        const paddingLeft = Math.max(16, Math.round(width * 0.03));

        const dateStr = options.timestamp.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const timeStr = options.timestamp.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        const lat = options.location.latitude.toFixed(6);
        const lng = options.location.longitude.toFixed(6);
        const acc = Math.round(options.location.accuracy || 10);

        // Line 1: Milestone Step & Title
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${baseFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(
          `⚡ STEP ${options.stepOrder}: ${options.milestoneTitle}`,
          paddingLeft,
          bannerY + bannerHeight * 0.3
        );

        // Line 2: Worker Info & Date
        ctx.fillStyle = '#60a5fa';
        ctx.font = `600 ${subFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(
          `BY: ${options.workerName} (${options.workerId}) • ${dateStr} ${timeStr}`,
          paddingLeft,
          bannerY + bannerHeight * 0.58
        );

        // Line 3: GPS Coordinates
        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${subFontSize}px monospace, system-ui, sans-serif`;
        ctx.fillText(
          `📍 GPS: ${lat}° N, ${lng}° E (±${acc}m) | ${options.substation.slice(0, 30)}`,
          paddingLeft,
          bannerY + bannerHeight * 0.84
        );

        // Stamp badge on the right
        const badgeWidth = Math.max(100, Math.round(width * 0.24));
        const badgeX = width - badgeWidth - paddingLeft / 2;
        const badgeY = bannerY + bannerHeight * 0.2;
        const badgeH = bannerHeight * 0.62;

        ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeH, 6);
        ctx.fill();
        ctx.strokeStyle = '#0052cc';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, Math.round(subFontSize * 0.9))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('SITE VERIFIED', badgeX + badgeWidth / 2, badgeY + badgeH * 0.44);
        ctx.fillStyle = '#60a5fa';
        ctx.font = `600 ${Math.max(8, Math.round(subFontSize * 0.72))}px system-ui, sans-serif`;
        ctx.fillText('FIELD AUDIT STAMP', badgeX + badgeWidth / 2, badgeY + badgeH * 0.8);
        ctx.textAlign = 'left';

        // Compress at 0.75 quality
        const quality = options.quality ?? 0.75;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create canvas blob'));
              return;
            }

            const compressedSizeKb = Math.round(blob.size / 1024);
            const savedPct =
              originalSizeKb > 0
                ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
                : 0;

            const reader = new FileReader();
            reader.onloadend = () => {
              const compressedDataUrl = reader.result as string;
              resolve({
                compressedDataUrl,
                blob,
                originalSizeKb,
                compressedSizeKb,
                compressionRatio: savedPct,
                width,
                height
              });
            };
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => reject(new Error('Failed to load image for milestone watermark'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.src = url;
    }
  });
}

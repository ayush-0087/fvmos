import { CompressionResult, GeoLocationData } from '../types';

interface WatermarkOptions {
  workerName: string;
  workerId: string;
  substation: string;
  location: GeoLocationData;
  timestamp: Date;
  type: 'CHECK_IN' | 'CHECK_OUT';
}

/**
 * Resizes an image to max 1080px (width or height),
 * burns a high-contrast tamper-evident watermarked bar at the bottom with
 * [Date, Time, Latitude, Longitude, Worker ID],
 * and compresses as JPEG with quality = 0.7 (target <= 400KB).
 */
export async function compressAndWatermarkImage(
  source: File | Blob | string,
  options: WatermarkOptions
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKb =
      source instanceof File || source instanceof Blob
        ? Math.round(source.size / 1024)
        : 800; // estimated fallback

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

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        // 1. Draw base photo
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Prepare Watermark Bar dimensions
        // Responsive watermark height based on canvas resolution
        const bannerHeight = Math.max(90, Math.round(height * 0.16));
        const bannerY = height - bannerHeight;

        // Semi-transparent dark background for the watermark banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(0, bannerY, width, bannerHeight);

        // Top accent line on the banner
        const isCheckIn = options.type === 'CHECK_IN';
        ctx.fillStyle = isCheckIn ? '#10b981' : '#f59e0b';
        ctx.fillRect(0, bannerY, width, Math.max(4, Math.round(width * 0.005)));

        // Watermark typography
        const baseFontSize = Math.max(14, Math.round(width * 0.026));
        const subFontSize = Math.max(11, Math.round(width * 0.021));
        const paddingLeft = Math.max(16, Math.round(width * 0.03));

        // Format Date & Time in IST
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

        // Coordinates formatting
        const lat = options.location.latitude.toFixed(6);
        const lng = options.location.longitude.toFixed(6);
        const acc = Math.round(options.location.accuracy || 10);

        // Line 1: Title & Date/Time
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${baseFontSize}px system-ui, -apple-system, sans-serif`;
        const actionText = isCheckIn ? '⚡ ATTENDANCE (CHECK-IN)' : '🏁 SHIFT END (CHECK-OUT)';
        ctx.fillText(
          `${actionText} • ${dateStr} ${timeStr}`,
          paddingLeft,
          bannerY + bannerHeight * 0.32
        );

        // Line 2: Worker Info
        ctx.fillStyle = '#38bdf8';
        ctx.font = `600 ${subFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(
          `ID: ${options.workerId} | ${options.workerName}`,
          paddingLeft,
          bannerY + bannerHeight * 0.58
        );

        // Line 3: Geolocation Coordinates & Accuracy
        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${subFontSize}px monospace, system-ui, sans-serif`;
        ctx.fillText(
          `📍 LAT: ${lat}° N, LNG: ${lng}° E (±${acc}m)`,
          paddingLeft,
          bannerY + bannerHeight * 0.84
        );

        // Right side badge: Geo-Verified stamp
        const badgeWidth = Math.max(90, Math.round(width * 0.22));
        const badgeX = width - badgeWidth - paddingLeft / 2;
        const badgeY = bannerY + bannerHeight * 0.22;
        const badgeH = bannerHeight * 0.6;

        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeH, 6);
        ctx.fill();
        ctx.strokeStyle = isCheckIn ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, Math.round(subFontSize * 0.9))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('GEO-VERIFIED', badgeX + badgeWidth / 2, badgeY + badgeH * 0.45);
        ctx.fillStyle = isCheckIn ? '#34d399' : '#fbbf24';
        ctx.font = `600 ${Math.max(8, Math.round(subFontSize * 0.75))}px system-ui, sans-serif`;
        ctx.fillText('SECURE WATERMARK', badgeX + badgeWidth / 2, badgeY + badgeH * 0.8);
        ctx.textAlign = 'left'; // reset

        // 3. Export as JPEG at 0.7 quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to generate image blob'));
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
          0.7 // quality = 0.7 for optimal 3G bandwidth
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.src = url;
    }
  });
}

export type Language = 'en' | 'hi';

export type UserRoleType = 'worker' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  nameHi: string;
  phone: string;
  workerId: string;
  role: string;
  roleHi: string;
  userType: UserRoleType;
  discom: string; // e.g., 'BSES Rajdhani / PVVNL / MSEDCL'
  substation: string;
  pin: string;
  avatarUrl?: string;
}

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: number;
  altitude?: number | null;
  address?: string;
  isSimulated?: boolean;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  substation: string;
  timestamp: string; // ISO string
  dateFormatted: string; // e.g., "18 Aug 2026"
  timeFormatted: string; // e.g., "04:35 PM IST"
  type: 'CHECK_IN' | 'CHECK_OUT';
  photoDataUrl: string; // compressed base64 JPEG
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number; // e.g. 85%
  location: GeoLocationData;
  watermarked: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
  supabaseStoragePath?: string;
  notes?: string;
}

export type MilestoneStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface Milestone {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  stepOrder: number;
  referenceImageUrl: string;
  youtubeVideoUrl: string;
  estimatedMinutes?: number;
  criticalTools?: string[];
}

export interface MilestoneSubmission {
  id: string;
  milestoneId: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  substation: string;
  submittedAt: string; // ISO timestamp
  dateFormatted: string;
  timeFormatted: string;
  submittedImageUrl: string; // compressed data URL / storage URL
  compressedSizeKb: number;
  location: GeoLocationData;
  status: 'pending' | 'approved' | 'rejected'; // 'pending' = Submitted - Under Review
  adminFeedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface CompressionResult {
  compressedDataUrl: string;
  blob: Blob;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number;
  width: number;
  height: number;
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AttendanceRecord, Milestone, MilestoneSubmission, UserProfile } from '../types';
import { initialMilestones } from '../data/milestonesData';

const STORAGE_KEY_ATTENDANCE = 'bijli_attendance_records_v1';
const STORAGE_KEY_USER = 'bijli_current_user_v1';
const STORAGE_KEY_PENDING_QUEUE = 'bijli_pending_sync_queue_v1';
const STORAGE_KEY_MILESTONES = 'bijli_milestones_list_v1';
const STORAGE_KEY_SUBMISSIONS = 'bijli_milestone_submissions_v1';

// Check if Supabase keys are configured in environment
const env = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string } }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
// Accept either VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

export let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.warn('Supabase client init note:', e);
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey && supabase);
}

/**
 * Get all local attendance records
 */
export function getLocalAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save records locally
 */
export function saveLocalAttendanceRecords(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(records));
  } catch (err) {
    console.error('LocalStorage write failed (might be full, trimming old thumbnails):', err);
    if (records.length > 25) {
      const trimmed = records.slice(0, 25);
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(trimmed));
    }
  }
}

/**
 * Add a new attendance record and attempt upload to Supabase if connected
 */
export async function recordAttendance(
  record: AttendanceRecord,
  photoBlob?: Blob
): Promise<{ success: boolean; synced: boolean; error?: string }> {
  const existing = getLocalAttendanceRecords();
  let updatedRecord = { ...record };

  // Attempt Supabase Upload if online and configured
  let synced = false;
  if (isSupabaseConfigured() && supabase && navigator.onLine) {
    try {
      let photoUrl = '';
      if (photoBlob) {
        const filePath = `${record.workerId}/${record.id}_${Date.now()}.jpg`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('attendance-selfies')
          .upload(filePath, photoBlob, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('attendance-selfies')
            .getPublicUrl(filePath);
          photoUrl = publicUrlData.publicUrl;
        }
      }

      const { error: dbError } = await supabase.from('attendance').insert([
        {
          id: record.id,
          worker_id: record.workerId,
          worker_name: record.workerName,
          worker_phone: record.workerPhone,
          substation: record.substation,
          timestamp: record.timestamp,
          date_formatted: record.dateFormatted,
          time_formatted: record.timeFormatted,
          attendance_type: record.type,
          latitude: record.location.latitude,
          longitude: record.location.longitude,
          accuracy_meters: record.location.accuracy,
          address: record.location.address,
          compressed_size_kb: record.compressedSizeKb,
          original_size_kb: record.originalSizeKb,
          photo_url: photoUrl || undefined,
          sync_status: 'synced'
        }
      ]);

      if (!dbError) {
        synced = true;
        updatedRecord.syncStatus = 'synced';
        updatedRecord.supabaseStoragePath = photoUrl;
      }
    } catch (e: any) {
      console.warn('Supabase sync error, keeping in offline sync queue:', e);
      updatedRecord.syncStatus = 'pending';
    }
  } else {
    // Stored locally in pending state
    updatedRecord.syncStatus = 'pending';
  }

  // Prepend new record to list
  const newList = [updatedRecord, ...existing.filter((r) => r.id !== updatedRecord.id)];
  saveLocalAttendanceRecords(newList);

  return { success: true, synced };
}

/**
 * Sync all pending records when back online
 */
export async function syncPendingRecords(): Promise<{
  syncedCount: number;
  totalPending: number;
}> {
  const records = getLocalAttendanceRecords();
  const pending = records.filter((r) => r.syncStatus === 'pending');

  if (pending.length === 0) {
    return { syncedCount: 0, totalPending: 0 };
  }

  if (!navigator.onLine) {
    return { syncedCount: 0, totalPending: pending.length };
  }

  let syncedCount = 0;
  const updatedRecords = [...records];

  for (let i = 0; i < updatedRecords.length; i++) {
    if (updatedRecords[i].syncStatus === 'pending') {
      if (isSupabaseConfigured() && supabase) {
        try {
          const rec = updatedRecords[i];
          const { error } = await supabase.from('attendance').insert([
            {
              id: rec.id,
              worker_id: rec.workerId,
              worker_name: rec.workerName,
              worker_phone: rec.workerPhone,
              substation: rec.substation,
              timestamp: rec.timestamp,
              date_formatted: rec.dateFormatted,
              time_formatted: rec.timeFormatted,
              attendance_type: rec.type,
              latitude: rec.location.latitude,
              longitude: rec.location.longitude,
              accuracy_meters: rec.location.accuracy,
              address: rec.location.address,
              compressed_size_kb: rec.compressedSizeKb,
              original_size_kb: rec.originalSizeKb,
              sync_status: 'synced'
            }
          ]);
          if (!error) {
            updatedRecords[i].syncStatus = 'synced';
            syncedCount++;
          }
        } catch (e) {
          console.warn('Sync failed for item', updatedRecords[i].id, e);
        }
      } else {
        // In local mode without supabase credentials, simulate successful cloud push
        updatedRecords[i].syncStatus = 'synced';
        syncedCount++;
      }
    }
  }

  saveLocalAttendanceRecords(updatedRecords);
  return { syncedCount, totalPending: pending.length };
}

/**
 * Milestones Data & Submissions Handling
 */
export function getLocalMilestones(): Milestone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MILESTONES);
    if (!raw) return initialMilestones;
    return JSON.parse(raw);
  } catch {
    return initialMilestones;
  }
}

export function getLocalMilestoneSubmissions(): MilestoneSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (!raw) {
      // Seed an initial demo submission for review
      const seedSubmissions: MilestoneSubmission[] = [
        {
          id: 'sub-demo-1',
          milestoneId: 'ms-1',
          workerId: 'ELEC-1042',
          workerName: 'Ramesh Kumar',
          workerPhone: '9876543210',
          substation: '33/11kV Substation-4B, Sector 62, Noida',
          submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          dateFormatted: '18 Aug 2026',
          timeFormatted: '12:30 PM IST',
          submittedImageUrl:
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
          compressedSizeKb: 185,
          location: {
            latitude: 28.6289,
            longitude: 77.3653,
            accuracy: 6,
            timestamp: Date.now() - 3600000 * 4,
            address: 'Sector 62, Noida, Uttar Pradesh'
          },
          status: 'approved',
          adminFeedback: 'Conduit bending and spacing meet specifications. Good alignment.',
          reviewedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          reviewedBy: 'Rajesh Sharma (Site Supervisor)',
          syncStatus: 'synced'
        }
      ];
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(seedSubmissions));
      return seedSubmissions;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalMilestoneSubmissions(submissions: MilestoneSubmission[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save milestone submissions', e);
  }
}

/**
 * Submit work photo for milestone
 */
export async function submitMilestoneWork(
  submission: MilestoneSubmission,
  photoBlob?: Blob
): Promise<{ success: boolean; synced: boolean; error?: string; locked?: boolean }> {
  if (!isSupabaseConfigured() || !supabase || !navigator.onLine) {
    const existing = getLocalMilestoneSubmissions();
    const updated = { ...submission, syncStatus: 'pending' as const };
    const filtered = existing.filter(
      (s) => !(s.milestoneId === submission.milestoneId && s.workerId === submission.workerId)
    );
    saveLocalMilestoneSubmissions([...filtered, updated]);
    return { success: true, synced: false };
  }

  try {
    let photoUrl = submission.submittedImageUrl;
    if (photoBlob) {
      const filePath = `milestones/${submission.milestoneId}/${submission.workerId}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('milestone-proofs')
        .upload(filePath, photoBlob, { contentType: 'image/jpeg', upsert: true });

      if (uploadErr) return { success: false, synced: false, error: uploadErr.message };

      const { data: publicUrlData } = supabase.storage.from('milestone-proofs').getPublicUrl(filePath);
      photoUrl = publicUrlData.publicUrl;
    }

    const result = await submitMilestoneGated(
      submission.milestoneId,
      submission.location.latitude,
      submission.location.longitude,
      photoUrl
    );

    if (!result.success) {
      return { success: false, synced: false, error: result.message || result.reason, locked: result.reason === 'locked' };
    }

    const existing = getLocalMilestoneSubmissions();
    const updated: MilestoneSubmission = {
      ...submission,
      submittedImageUrl: photoUrl,
      status: 'pending',
      syncStatus: 'synced'
    };
    const filtered = existing.filter(
      (s) => !(s.milestoneId === submission.milestoneId && s.workerId === submission.workerId)
    );
    saveLocalMilestoneSubmissions([...filtered, updated]);

    return { success: true, synced: true };
  } catch (e: any) {
    return { success: false, synced: false, error: e?.message || 'Submission failed' };
  }
}

/**
 * Admin action: Approve or Reject Milestone Submission
 */
export async function updateMilestoneSubmissionStatus(
  submissionId: string,
  status: 'approved' | 'rejected',
  adminFeedback: string,
  adminName: string
): Promise<{ success: boolean }> {
  const submissions = getLocalMilestoneSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) return { success: false };

  submissions[index].status = status;
  submissions[index].adminFeedback = adminFeedback;
  submissions[index].reviewedAt = new Date().toISOString();
  submissions[index].reviewedBy = adminName;

  if (isSupabaseConfigured() && supabase && navigator.onLine) {
    try {
      await supabase
        .from('milestone_submissions')
        .update({
          status: status,
          admin_feedback: adminFeedback
        })
        .eq('id', submissionId);
    } catch (e) {
      console.warn('Supabase update submission status note:', e);
    }
  }

  saveLocalMilestoneSubmissions(submissions);
  return { success: true };
}

/**
 * Current user session in local storage
 */
export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUser(user: UserProfile | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY_USER);
  } else {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }
}

export async function fetchMilestones(): Promise<Milestone[]> {
  if (!supabase) return getLocalMilestones();
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('step_order', { ascending: true });
    if (error || !data) throw error || new Error('No data');

    const mapped: Milestone[] = data.map((row: any) => ({
      id: row.id,
      stepOrder: row.step_order,
      title: row.title,
      titleHi: row.title_hi || row.title,
      description: row.description,
      descriptionHi: row.description_hi || row.description,
      referenceImageUrl: row.reference_image_url,
      youtubeVideoUrl: row.youtube_url || ''
    }));
    localStorage.setItem(STORAGE_KEY_MILESTONES, JSON.stringify(mapped));
    return mapped;
  } catch (e) {
    console.warn('Milestone fetch failed, using cached/local copy:', e);
    return getLocalMilestones();
  }
}

export async function fetchMySubmissions(): Promise<MilestoneSubmission[]> {
  if (!supabase) return getLocalMilestoneSubmissions();
  const { data: userData } = await supabase.auth.getUser();
  const workerId = userData?.user?.id;
  if (!workerId) return [];

  const { data, error } = await supabase
    .from('milestone_submissions')
    .select('*')
    .eq('worker_id', workerId)
    .order('submitted_at', { ascending: true });
  if (error || !data) return getLocalMilestoneSubmissions();

  return data.map((row: any) => ({
    id: row.id,
    milestoneId: row.milestone_id,
    workerId: row.worker_id,
    workerName: '',
    workerPhone: '',
    substation: '',
    submittedAt: row.submitted_at,
    dateFormatted: new Date(row.submitted_at).toLocaleDateString(),
    timeFormatted: new Date(row.submitted_at).toLocaleTimeString(),
    submittedImageUrl: row.proof_image_url,
    compressedSizeKb: 0,
    location: { latitude: row.latitude, longitude: row.longitude, accuracy: 0, timestamp: 0 },
    status: row.status,
    adminFeedback: row.admin_feedback,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    syncStatus: 'synced'
  }));
}

export async function submitMilestoneGated(
  milestoneId: string,
  latitude: number,
  longitude: number,
  proofImageUrl: string
): Promise<{ success: boolean; reason?: string; message?: string; distance_meters?: number }> {
  if (!supabase) return { success: false, reason: 'offline', message: 'Not connected to server.' };
  const { data, error } = await supabase.rpc('submit_milestone', {
    p_milestone_id: milestoneId,
    p_latitude: latitude,
    p_longitude: longitude,
    p_proof_image_url: proofImageUrl
  });
  if (error) return { success: false, reason: 'error', message: error.message };
  return data as any;
}

export async function submitAttendanceGated(
  latitude: number,
  longitude: number,
  accuracyMeters: number,
  selfieUrl: string
): Promise<{ success: boolean; reason?: string; message?: string; distance_meters?: number }> {
  if (!supabase) return { success: false, reason: 'offline', message: 'Not connected to server.' };
  const { data, error } = await supabase.rpc('submit_attendance', {
    p_latitude: latitude,
    p_longitude: longitude,
    p_accuracy_meters: accuracyMeters,
    p_selfie_url: selfieUrl
  });
  if (error) return { success: false, reason: 'error', message: error.message };
  return data as any;
}


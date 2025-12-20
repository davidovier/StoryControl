import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';

// Create Supabase client (only if credentials are configured)
let supabase = null;

const supabaseUrl = config.SUPABASE_URL;
const supabaseKey = config.SUPABASE_SERVICE_KEY;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized');
} else {
  console.log('Supabase not configured - captures will only be saved locally');
}

/**
 * Ensure the storage bucket exists
 */
async function ensureBucket() {
  if (!supabase) return false;

  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === config.STORAGE_BUCKET);

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(config.STORAGE_BUCKET, {
      public: false,
      fileSizeLimit: 10485760, // 10MB
    });
    if (error && !error.message.includes('already exists')) {
      console.error('Failed to create storage bucket:', error.message);
      return false;
    }
    console.log(`Created storage bucket: ${config.STORAGE_BUCKET}`);
  }
  return true;
}

/**
 * Upload a screenshot to Supabase Storage
 * @param {string} localPath - Local file path
 * @param {string} handle - Instagram handle
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @param {string} filename - Screenshot filename
 * @returns {Promise<string|null>} Storage path or null on failure
 */
export async function uploadScreenshot(localPath, handle, dateStr, filename) {
  if (!supabase) return null;

  try {
    await ensureBucket();

    const storagePath = `${handle}/${dateStr}/${filename}`;
    const fileBuffer = fs.readFileSync(localPath);

    const { error } = await supabase.storage
      .from(config.STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload ${filename}:`, error.message);
      return null;
    }

    console.log(`Uploaded: ${storagePath}`);
    return storagePath;
  } catch (err) {
    console.error(`Error uploading screenshot:`, err.message);
    return null;
  }
}

/**
 * Get a signed URL for a screenshot
 * @param {string} storagePath - Path in storage
 * @param {number} expiresIn - Seconds until expiry (default 1 hour)
 * @returns {Promise<string|null>} Signed URL or null
 */
export async function getSignedUrl(storagePath, expiresIn = 3600) {
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(config.STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    console.error('Failed to get signed URL:', error.message);
    return null;
  }

  return data?.signedUrl || null;
}

/**
 * Get or create an influencer record
 * @param {string} handle - Instagram handle
 * @returns {Promise<string|null>} Influencer ID or null if Supabase not configured
 */
export async function getOrCreateInfluencer(handle) {
  if (!supabase) return null;

  // Try to find existing
  const { data: existing } = await supabase
    .from('influencers')
    .select('id')
    .eq('ig_handle', handle)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new
  const { data: created, error } = await supabase
    .from('influencers')
    .insert({
      ig_handle: handle,
      ig_user_id: handle,
      status: 'active'
    })
    .select('id')
    .single();

  if (error) {
    console.error(`Failed to create influencer ${handle}:`, error.message);
    return null;
  }

  return created?.id || null;
}

/**
 * Record a story capture in the database
 * @param {object} capture - Capture data
 * @param {string} capture.influencerId - Influencer UUID
 * @param {string} capture.storyMediaId - Unique ID for the story (can be timestamp-based)
 * @param {string} capture.mediaType - IMAGE or VIDEO
 * @param {string} capture.storagePath - Local path to the file
 * @param {Date} capture.postedAt - When the story was posted
 * @returns {Promise<boolean>} Success status
 */
export async function recordCapture(capture) {
  if (!supabase) return false;

  const { error } = await supabase
    .from('story_captures')
    .insert({
      influencer_id: capture.influencerId,
      story_media_id: capture.storyMediaId,
      media_type: capture.mediaType || 'IMAGE',
      storage_path: capture.storagePath,
      posted_at: capture.postedAt || new Date().toISOString(),
      captured_at: new Date().toISOString(),
      download_status: 'completed',
      review_status: 'pending'
    });

  if (error) {
    // Ignore duplicate key errors (story already captured)
    if (error.code === '23505') {
      return true;
    }
    console.error('Failed to record capture:', error.message);
    return false;
  }

  return true;
}

/**
 * Update the last poll timestamp for an influencer
 * @param {string} influencerId - Influencer UUID
 */
export async function updateLastPoll(influencerId) {
  if (!supabase || !influencerId) return;

  await supabase
    .from('influencers')
    .update({ last_poll_at: new Date().toISOString() })
    .eq('id', influencerId);
}

/**
 * Get handles to monitor from Supabase (if configured)
 * Falls back to local handles.txt if not configured
 * @returns {Promise<string[]|null>} Array of handles or null to use local file
 */
export async function getHandlesFromSupabase() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('influencers')
    .select('ig_handle')
    .in('status', ['active', 'pending']);

  if (error) {
    console.error('Failed to fetch handles from Supabase:', error.message);
    return null;
  }

  return data?.map(i => i.ig_handle) || [];
}

export { supabase };

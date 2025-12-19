import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

// Create Supabase client (only if credentials are configured)
let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  console.log('Supabase client initialized');
} else {
  console.log('Supabase not configured - captures will only be saved locally');
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

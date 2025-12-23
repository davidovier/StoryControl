import { loadHandles } from './handles.js';
import { createDayDir } from './storage.js';
import {
  launchContext,
  ensureLoggedIn,
  openProfile,
  tryOpenStoryViewer,
  captureStoriesGroupedByPostedTime,
  saveSessionState,
} from './instagram.js';
import {
  getHandlesFromSupabase,
  getOrCreateInfluencer,
  updateLastPoll
} from './supabase.js';

/**
 * Run the story capture once for all handles
 */
export async function runOnce() {
  console.log('='.repeat(50));
  console.log(`Story Agent - Run started at ${new Date().toISOString()}`);
  console.log('='.repeat(50));

  // Try to load handles from Supabase first, fall back to local file
  let handles = await getHandlesFromSupabase();
  if (handles === null || handles.length === 0) {
    handles = loadHandles();
    console.log(`Loaded ${handles.length} handle(s) from local file: ${handles.join(', ')}`);
  } else {
    console.log(`Loaded ${handles.length} handle(s) from Supabase: ${handles.join(', ')}`);
  }

  if (handles.length === 0) {
    console.log('No handles to process. Exiting.');
    return;
  }

  // Launch browser context
  const { context, browser } = await launchContext();
  const page = await context.newPage();

  try {
    // Ensure logged in
    await ensureLoggedIn(page);

    // Process each handle
    for (const handle of handles) {
      console.log('\n' + '-'.repeat(40));
      console.log(`Processing handle: @${handle}`);
      console.log('-'.repeat(40));

      try {
        // Get or create influencer in Supabase
        const influencerId = await getOrCreateInfluencer(handle);

        // Create day directory for this handle
        const dayDir = createDayDir(handle);

        // Open profile
        await openProfile(page, handle);

        // Try to open story viewer
        const viewerOpened = await tryOpenStoryViewer(page);

        if (viewerOpened) {
          // Capture stories (pass influencerId for Supabase sync)
          await captureStoriesGroupedByPostedTime(page, dayDir, handle, influencerId);
        } else {
          console.log(`No stories available for @${handle}`);
        }

        // Update last poll timestamp
        await updateLastPoll(influencerId);

      } catch (err) {
        console.error(`Error processing @${handle}:`, err.message);
        // Continue with next handle
      }
    }

    // Save session state (for GitHub Actions)
    await saveSessionState(context);

  } finally {
    // Close browser
    console.log('\nClosing browser...');
    await context.close();
    if (browser) {
      await browser.close();
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Run completed at ${new Date().toISOString()}`);
  console.log('='.repeat(50));
}

// Run if this is the main module
runOnce().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

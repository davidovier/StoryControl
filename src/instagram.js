import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import { createSessionDir, getScreenshotFilename, getDateString } from './storage.js';
import { recordCapture, uploadScreenshot } from './supabase.js';

// Store browser reference for cleanup
let _browser = null;

/**
 * Launch browser context - uses session state file for GitHub Actions,
 * persistent context for local/Railway
 * @returns {Promise<{context: import('playwright').BrowserContext, browser: import('playwright').Browser|null}>}
 */
export async function launchContext() {
  const browserArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ];

  if (config.USE_SESSION_STATE) {
    // GitHub Actions mode: use session state file
    console.log(`Launching browser with session state (headless: ${config.HEADLESS})`);

    _browser = await chromium.launch({
      headless: config.HEADLESS,
      args: browserArgs,
    });

    // Check if session state file exists
    let storageState = undefined;
    if (fs.existsSync(config.SESSION_STATE_FILE)) {
      console.log(`Restoring session from ${config.SESSION_STATE_FILE}`);
      storageState = config.SESSION_STATE_FILE;
    }

    const context = await _browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      storageState,
    });

    return { context, browser: _browser };
  } else {
    // Local/Railway mode: use persistent context
    console.log(`Launching persistent context (headless: ${config.HEADLESS}, session: ${config.SESSION_DIR})`);

    const context = await chromium.launchPersistentContext(config.SESSION_DIR, {
      headless: config.HEADLESS,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      args: config.IS_RAILWAY ? browserArgs : [],
    });

    return { context, browser: null };
  }
}

/**
 * Save session state to file (for GitHub Actions)
 * @param {import('playwright').BrowserContext} context
 */
export async function saveSessionState(context) {
  if (!config.USE_SESSION_STATE) return;

  try {
    // Ensure directory exists
    const dir = path.dirname(config.SESSION_STATE_FILE);
    fs.mkdirSync(dir, { recursive: true });

    await context.storageState({ path: config.SESSION_STATE_FILE });
    console.log(`Session saved to ${config.SESSION_STATE_FILE}`);
  } catch (err) {
    console.error('Failed to save session state:', err.message);
  }
}

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ensure the user is logged into Instagram
 * @param {import('playwright').Page} page
 */
export async function ensureLoggedIn(page) {
  console.log('Navigating to Instagram...');
  await page.goto(config.IG_BASE_URL, { waitUntil: 'load', timeout: 60000 });
  await sleep(3000);

  // Check if we're on a login page
  const loginForm = await page.$('input[name="username"]');

  if (loginForm) {
    console.log('Login required, filling credentials...');

    if (!config.IG_USERNAME || !config.IG_PASSWORD) {
      throw new Error('IG_USERNAME and IG_PASSWORD must be set in .env');
    }

    // Fill username
    await page.fill('input[name="username"]', config.IG_USERNAME);
    await sleep(500);

    // Fill password
    await page.fill('input[name="password"]', config.IG_PASSWORD);
    await sleep(500);

    // Click login button
    await page.click('button[type="submit"]');
    console.log('Submitted login form, waiting for navigation...');

    // Wait for navigation to complete
    try {
      await page.waitForNavigation({ waitUntil: 'load', timeout: 30000 });
    } catch {
      // Navigation might have already happened
    }
    await sleep(5000);

    // Try to dismiss "Save Login Info" popup
    await dismissPopup(page, 'Not Now');
    await sleep(1000);

    // Try to dismiss "Turn on Notifications" popup
    await dismissPopup(page, 'Not Now');
    await sleep(1000);
  } else {
    console.log('Already logged in.');
  }

  // Handle any remaining popups
  await dismissPopup(page, 'Not Now');
}

/**
 * Try to dismiss a popup with the given button text
 * @param {import('playwright').Page} page
 * @param {string} buttonText
 */
async function dismissPopup(page, buttonText) {
  try {
    const button = await page.$(`button:has-text("${buttonText}")`);
    if (button) {
      await button.click();
      console.log(`Dismissed popup with "${buttonText}"`);
      await sleep(500);
    }
  } catch {
    // Popup not found or already dismissed
  }
}

/**
 * Navigate to a user's profile
 * @param {import('playwright').Page} page
 * @param {string} handle
 */
export async function openProfile(page, handle) {
  const profileUrl = `${config.IG_BASE_URL}/${handle}/`;
  console.log(`Opening profile: ${profileUrl}`);
  await page.goto(profileUrl, { waitUntil: 'load', timeout: 60000 });
  await sleep(3000);

  // Dismiss any popups that might appear
  await dismissPopup(page, 'Not Now');
  await dismissPopup(page, 'Not now');
}

/**
 * Check if the story viewer is currently open
 * @param {import('playwright').Page} page
 * @returns {Promise<boolean>}
 */
export async function storyViewerIsOpen(page) {
  // Check URL first - most reliable
  const currentUrl = page.url();
  if (currentUrl.includes('/stories/')) {
    return true;
  }

  // Check for close button (various forms)
  const closeButton = await page.$('svg[aria-label="Close"]') ||
                      await page.$('button[aria-label="Close"]');

  // Check for dialog
  const dialog = await page.$('div[role="dialog"]');

  // Check for story progress bar
  const progressBar = await page.$('[role="progressbar"]');

  return !!(closeButton || dialog || progressBar);
}

/**
 * Try to open the story viewer by clicking on the profile avatar
 * @param {import('playwright').Page} page
 * @returns {Promise<boolean>} True if story viewer opened
 */
export async function tryOpenStoryViewer(page) {
  console.log('Attempting to open story viewer...');

  // Try clicking on the profile header image (avatar with story ring)
  const avatarSelectors = [
    'header canvas', // Story ring canvas
    'header section > div > div > div > span[role="link"]', // Profile pic container with story
    'header img[alt*="profile picture"]',
    'header img[alt*="Profile"]',
    'header img',
    'header [role="button"] img',
  ];

  for (const selector of avatarSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        console.log(`Clicked on: ${selector}`);

        // Wait longer for story viewer to load
        await sleep(2500);

        if (await storyViewerIsOpen(page)) {
          console.log('Story viewer is now open!');
          return true;
        }

        // Check current URL - if it contains /stories/, viewer opened
        const currentUrl = page.url();
        if (currentUrl.includes('/stories/')) {
          console.log('Story viewer opened (detected via URL)');
          await sleep(1000);
          return true;
        }
      }
    } catch (err) {
      console.log(`Selector ${selector} failed: ${err.message}`);
    }
  }

  console.log('Could not open story viewer (no stories or selector failed)');
  return false;
}

/**
 * Get the posted time label from the story viewer
 * @param {import('playwright').Page} page
 * @returns {Promise<string>}
 */
export async function getPostedTimeLabel(page, debug = false) {
  // Try various selectors for the time element
  const timeSelectors = [
    'time',
    'time[datetime]',
    'div[role="dialog"] time',
    'div[role="dialog"] header time',
    'header time',
    '[data-testid="story-viewer-timestamp"]',
    'span[dir="auto"]', // Instagram often uses this
  ];

  for (const selector of timeSelectors) {
    try {
      const timeElements = await page.$$(selector);
      for (const timeElement of timeElements) {
        const text = await timeElement.textContent();
        if (text && text.trim()) {
          const trimmed = text.trim();
          if (debug) {
            console.log(`[DEBUG] Selector "${selector}" found: "${trimmed}"`);
          }
          // Check if it looks like a time label (various formats, including localized)
          // English: 1h, 2d, 3m, 1 hour ago, yesterday, etc.
          // Dutch: 13 u., 1 d., 5 min., etc.
          // German: 1 Std., 2 T., etc.
          if (/^\d+\s*[mhd]\.?$/i.test(trimmed) ||
              /^\d+\s*(u|uur|min|d|dag|std|t)\.?$/i.test(trimmed) ||
              /^(yesterday|today|just now|gisteren|vandaag|gestern|heute)$/i.test(trimmed) ||
              /^\d+\s*(min|hour|day|week|uur|dag|weken?)s?\s*(ago|geleden)?\.?$/i.test(trimmed)) {
            return trimmed;
          }
          // Also check for datetime attribute
          const datetime = await timeElement.getAttribute('datetime');
          if (datetime && debug) {
            console.log(`[DEBUG] Found datetime attribute: "${datetime}"`);
          }
        }
      }
    } catch {
      // Try next selector
    }
  }

  // Try to find any text that looks like a timestamp in the page
  try {
    const allText = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      const texts = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent?.trim();
        if (text && text.length < 20) {
          texts.push(text);
        }
      }
      return texts;
    });

    // Look for time patterns
    for (const text of allText) {
      if (/^\d+\s*[mhd]$/i.test(text)) {
        return text;
      }
      if (/^(yesterday|today|just now)$/i.test(text)) {
        return text;
      }
      if (/^\d+\s*(min|hour|day|week)s?\s*ago$/i.test(text)) {
        return text;
      }
    }
  } catch {
    // Fallback failed
  }

  // Fallback: try to parse time from any visible header/top area
  try {
    const header = await page.$('div[role="dialog"] header');
    if (header) {
      const text = await header.textContent();
      // Match patterns like "1h", "3h", "1d", "Yesterday", "Today"
      const match = text?.match(/(\d+\s*[mhd]|\d+\s*(min|hour|day)s?\s*ago|\bYesterday\b|\bToday\b|\bJust now\b)/i);
      if (match) {
        return match[1];
      }
    }
  } catch {
    // Fallback failed
  }

  return 'unknown';
}

/**
 * Close the story viewer
 * @param {import('playwright').Page} page
 */
async function closeStoryViewer(page) {
  try {
    // Try clicking close button
    const closeButton = await page.$('svg[aria-label="Close"]') ||
                        await page.$('button[aria-label="Close"]');
    if (closeButton) {
      await closeButton.click();
      await sleep(500);
      return;
    }
  } catch {
    // Fall through to Escape
  }

  // Fallback: press Escape
  await page.keyboard.press('Escape');
  await sleep(500);
}

/**
 * Capture stories grouped by posted time
 * @param {import('playwright').Page} page
 * @param {string} dayDir - The day directory for this handle
 * @param {string} handle - Instagram handle
 * @param {string|null} influencerId - Supabase influencer UUID (optional)
 */
export async function captureStoriesGroupedByPostedTime(page, dayDir, handle = '', influencerId = null) {
  let sessionIndex = 1;
  let shotIndex = 1;
  let lastLabel = null;
  let sessionDir = null;
  let lastUrl = '';
  let sameUrlCount = 0;
  let consecutiveClosedChecks = 0;

  const startTime = Date.now();
  console.log('Starting story capture...');

  // Get initial label and create first session
  const initialLabel = await getPostedTimeLabel(page);
  lastLabel = initialLabel;
  sessionDir = createSessionDir(dayDir, sessionIndex, initialLabel);
  console.log(`Session ${sessionIndex}: label="${initialLabel}"`);

  while (true) {
    // Check safety timeout
    if (Date.now() - startTime > config.STORY_MAX_DURATION_MS) {
      console.log('Safety timeout reached, stopping capture.');
      break;
    }

    // Check if viewer is still open (require multiple consecutive checks to confirm closed)
    const isOpen = await storyViewerIsOpen(page);
    if (!isOpen) {
      consecutiveClosedChecks++;
      if (consecutiveClosedChecks >= 3) {
        console.log('Story viewer confirmed closed, finishing capture.');
        break;
      }
      // Wait a bit and recheck
      await sleep(500);
      continue;
    } else {
      consecutiveClosedChecks = 0;
    }

    // Get current label
    const currentLabel = await getPostedTimeLabel(page);

    // Check if label changed (new session)
    if (currentLabel !== lastLabel && currentLabel !== 'unknown') {
      sessionIndex++;
      shotIndex = 1;
      lastLabel = currentLabel;
      sessionDir = createSessionDir(dayDir, sessionIndex, currentLabel);
      console.log(`Session ${sessionIndex}: label="${currentLabel}"`);
    }

    // Use current label for filename (or last known if unknown)
    const labelForFilename = currentLabel !== 'unknown' ? currentLabel : lastLabel;

    // Take screenshot
    const filename = getScreenshotFilename(shotIndex, labelForFilename);
    const filepath = path.join(sessionDir, filename);

    try {
      await page.screenshot({ path: filepath, fullPage: false });
      console.log(`Screenshot: ${filename} (label: ${labelForFilename})`);

      // Upload to Supabase Storage
      const dateStr = getDateString();
      const storagePath = await uploadScreenshot(filepath, handle, dateStr, filename);

      // Record to Supabase database if configured
      if (influencerId) {
        const storyMediaId = `${handle}_${Date.now()}_${shotIndex}`;
        await recordCapture({
          influencerId,
          storyMediaId,
          mediaType: 'IMAGE',
          storagePath: storagePath || filepath, // Use storage path if uploaded, else local
          postedAt: new Date().toISOString()
        });
      }

      shotIndex++;
    } catch (err) {
      console.error('Screenshot failed:', err.message);
    }

    // Wait for the screenshot interval
    await sleep(config.SCREENSHOT_EVERY_MS);

    // Check if we're stuck on the same story (URL hasn't changed for a while)
    const currentUrl = page.url();
    if (currentUrl === lastUrl) {
      sameUrlCount++;
      // If stuck on same URL for 5+ screenshots, nudge forward
      if (sameUrlCount >= 5) {
        console.log('Nudging forward (story may be stuck)...');
        await page.keyboard.press('ArrowRight');
        await sleep(500);
        sameUrlCount = 0;
      }
    } else {
      lastUrl = currentUrl;
      sameUrlCount = 0;
    }
  }

  // Close the viewer
  await closeStoryViewer(page);
  console.log(`Capture complete. ${sessionIndex} session(s), last shot index: ${shotIndex - 1}`);
}

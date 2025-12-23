/**
 * Export Instagram session for GitHub Actions
 *
 * This script:
 * 1. Opens a browser window
 * 2. Logs into Instagram (or uses existing session)
 * 3. Exports cookies/localStorage to a file
 * 4. Outputs base64-encoded session for GitHub Secrets
 *
 * Run: npm run export-session
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SESSION_DIR = path.join(ROOT_DIR, 'sessions', 'ig');
const STATE_FILE = path.join(SESSION_DIR, 'state.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function exportSession() {
  console.log('='.repeat(50));
  console.log('Instagram Session Export Tool');
  console.log('='.repeat(50));
  console.log('\nThis will open a browser window.');
  console.log('If not logged in, please log in manually.');
  console.log('Once logged in, press Enter in this terminal.\n');

  // Ensure session directory exists
  fs.mkdirSync(SESSION_DIR, { recursive: true });

  // Launch browser with persistent context (to reuse existing session if any)
  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  // Navigate to Instagram
  console.log('Opening Instagram...');
  await page.goto('https://www.instagram.com/', { waitUntil: 'load' });
  await sleep(3000);

  // Check if logged in
  const loginForm = await page.$('input[name="username"]');

  if (loginForm) {
    console.log('\n⚠️  Not logged in!');
    console.log('Please log in manually in the browser window.');
    console.log('Handle any 2FA prompts if needed.');
    console.log('\nPress Enter here when you are fully logged in...');

    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  } else {
    console.log('✅ Already logged in!');
  }

  // Verify login by checking for home feed elements
  await page.goto('https://www.instagram.com/', { waitUntil: 'load' });
  await sleep(2000);

  // Export session state
  console.log('\nExporting session state...');
  await context.storageState({ path: STATE_FILE });

  // Read and encode for GitHub Secrets
  const stateContent = fs.readFileSync(STATE_FILE, 'utf-8');
  const base64State = Buffer.from(stateContent).toString('base64');

  console.log('\n' + '='.repeat(50));
  console.log('✅ Session exported successfully!');
  console.log('='.repeat(50));

  console.log('\n📋 Next Steps:\n');
  console.log('1. Go to: https://github.com/davidovier/StoryControl/settings/secrets/actions');
  console.log('\n2. Create these secrets:\n');
  console.log('   IG_USERNAME = your Instagram username');
  console.log('   IG_PASSWORD = your Instagram password');
  console.log('   IG_SESSION  = (the base64 string below)');
  console.log('   SUPABASE_URL = https://stmdoiyfnkecpcrduqoe.supabase.co');
  console.log('   SUPABASE_SECRET_KEY = your Supabase secret key');
  console.log('   GH_PAT = (a GitHub Personal Access Token with repo scope)');

  console.log('\n3. IG_SESSION value (copy everything between the lines):\n');
  console.log('-'.repeat(50));
  console.log(base64State);
  console.log('-'.repeat(50));

  console.log('\n📌 The session is also saved locally at:');
  console.log(`   ${STATE_FILE}`);

  // Close browser
  await context.close();

  console.log('\n✨ Done! You can now close this terminal.');
  process.exit(0);
}

exportSession().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

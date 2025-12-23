import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Detect Railway environment
const IS_RAILWAY = !!process.env.RAILWAY_ENVIRONMENT;

export const config = {
  // Environment
  IS_RAILWAY,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Timezone
  TZ: process.env.TZ || 'Europe/Amsterdam',

  // Scheduler
  CRON_SCHEDULE: '0 13 * * *', // Daily at 13:00

  // Screenshot timing
  SCREENSHOT_EVERY_MS: 3000,

  // Safety cap for story viewing (10 minutes)
  STORY_MAX_DURATION_MS: 10 * 60 * 1000,

  // Paths - use Railway volume mount if available
  CAPTURES_DIR: IS_RAILWAY
    ? '/app/captures'
    : path.join(ROOT_DIR, 'captures'),
  SESSION_DIR: process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'ig')
    : path.join(ROOT_DIR, 'sessions', 'ig'),
  HANDLES_FILE: path.join(ROOT_DIR, 'handles.txt'),

  // Instagram credentials (from env)
  IG_USERNAME: process.env.IG_USERNAME,
  IG_PASSWORD: process.env.IG_PASSWORD,

  // Instagram URL
  IG_BASE_URL: 'https://www.instagram.com',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY,

  // Storage bucket for screenshots
  STORAGE_BUCKET: process.env.STORAGE_BUCKET || 'story-captures',

  // Playwright settings
  HEADLESS: IS_RAILWAY || process.env.HEADLESS === 'true',

  // Use session state file instead of persistent context (for GitHub Actions)
  USE_SESSION_STATE: process.env.USE_SESSION_STATE === 'true',
  SESSION_STATE_FILE: process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'ig', 'state.json')
    : path.join(ROOT_DIR, 'sessions', 'ig', 'state.json'),
};

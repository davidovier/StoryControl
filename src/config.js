import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export const config = {
  // Timezone
  TZ: process.env.TZ || 'Europe/Amsterdam',

  // Scheduler
  CRON_SCHEDULE: '0 13 * * *', // Daily at 13:00

  // Screenshot timing
  SCREENSHOT_EVERY_MS: 3000,

  // Safety cap for story viewing (10 minutes)
  STORY_MAX_DURATION_MS: 10 * 60 * 1000,

  // Paths
  CAPTURES_DIR: path.join(ROOT_DIR, 'captures'),
  SESSION_DIR: path.join(ROOT_DIR, 'sessions'),
  HANDLES_FILE: path.join(ROOT_DIR, 'handles.txt'),

  // Instagram credentials (from env)
  IG_USERNAME: process.env.IG_USERNAME,
  IG_PASSWORD: process.env.IG_PASSWORD,

  // Instagram URL
  IG_BASE_URL: 'https://www.instagram.com',
};

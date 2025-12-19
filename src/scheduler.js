import cron from 'node-cron';
import { config } from './config.js';
import { runOnce } from './runOnce.js';

console.log('='.repeat(50));
console.log('Story Agent Scheduler');
console.log('='.repeat(50));
console.log(`Timezone: ${config.TZ}`);
console.log(`Schedule: ${config.CRON_SCHEDULE} (daily at 13:00)`);
console.log('Waiting for scheduled run...');
console.log('Press Ctrl+C to stop.\n');

// Schedule the job
cron.schedule(config.CRON_SCHEDULE, async () => {
  console.log(`\nScheduled run triggered at ${new Date().toISOString()}`);
  try {
    await runOnce();
  } catch (err) {
    console.error('Scheduled run failed:', err.message);
  }
}, {
  timezone: config.TZ,
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nScheduler stopped.');
  process.exit(0);
});

# Architecture

## Stack
- Node.js (LTS)
- Playwright (Chromium)
- node-cron for local schedule
- dotenv for env vars

## Key design choices
### Persistent browser context
- Use Playwright `launchPersistentContext(userDataDir)` to keep cookies and sessions.
- Store profile in `sessions/ig` (gitignored).

### Headed mode
- Default to `headless: false` for login stability.
- Future option: allow headless mode via env flag.

### Best-effort selectors
Instagram DOM changes often. Prefer:
- “Try selector A, then B, then fallback” approach.
- Avoid brittle deep CSS paths.

### Session grouping
Group by detecting “posted time label” from:
- `<time>` in story header (best)
- fallback parsing from dialog header innerText
- fallback to `"unknown"`

## Components / modules (suggested)
- `src/config.*` env/config parsing
- `src/handles.*` reading handles.txt
- `src/instagram.*` navigation + capture loop
- `src/storage.*` folder creation + safe filenames
- `src/runOnce.*` orchestrates one complete run
- `src/scheduler.*` cron schedule runner

## Runtime flow
1. Launch persistent browser context
2. Ensure logged in
3. For each handle:
   - open profile
   - try open story viewer
   - if open → capture loop:
     - read posted time label
     - if label changed → new session folder
     - screenshot
     - wait 3s
     - nudge next (ArrowRight) to avoid stalls
     - exit when viewer closed or timeout
4. Close browser context

## Key parameters (config)
- `SCREENSHOT_EVERY_MS = 3000`
- `STORY_MAX_DURATION_MS = 10min` per handle (safety)
- `CRON_SCHEDULE = 0 13 * * *` timezone Europe/Amsterdam

# Claude Code Instructions (Local IG Story Capture Agent)

You are a coding agent working in a local repo that already contains these reference docs:
- README.md
- requirements.md
- architecture.md
- implementation-notes.md
- selectors.md
- security.md
- ops.md
- tasks.md

Your job: implement the MVP described in those docs.

## Non-negotiables
- Do NOT add any stealth / evasion / captcha solving / fingerprint spoofing.
- Do NOT log secrets (IG_USERNAME / IG_PASSWORD).
- Use Playwright with a persistent profile directory at `sessions/ig`.
- Output screenshots to `captures/<handle>/<YYYY-MM-DD>/session_###_<label>/...png`.
- Screenshot cadence: every 3000ms.
- Run daily at 13:00 Europe/Amsterdam when scheduler is running.

## Deliverables (must exist as real files)
1) `package.json` with scripts:
   - `run:once`
   - `run:scheduler`
2) `src/` implementation:
   - `src/config.js`
   - `src/handles.js`
   - `src/storage.js`
   - `src/instagram.js`
   - `src/runOnce.js`
   - `src/scheduler.js`
3) `.gitignore` containing at least:
   - `.env`
   - `sessions/`
   - `captures/`
   - `node_modules/`
   - `.DS_Store`
4) `handles.txt` template (with comments) if not present
5) `.env.example` template (no real secrets)

## Implementation guidance
- Node.js ESM (`"type": "module"` in package.json).
- Use Playwright Chromium and `launchPersistentContext`.
- Default `headless: false` for stability.
- Make selectors best-effort (see selectors.md).
- Session grouping: read the “posted time label” from the story viewer header; when it changes, create a new session folder.
- Safety cap: stop capture for a handle after ~10 minutes to prevent infinite loops.
- Errors for one handle must not stop the full run.

## Testing checklist (do after implementation)
- `npm i` then `npx playwright install`
- Create `.env` from `.env.example`
- Put 1–2 test handles in `handles.txt`
- Run `npm run run:once`
- Confirm:
  - If story exists → screenshots saved as required
  - If no story → logs say so, no folder created except day folder (acceptable either way)
- Run `npm run run:scheduler` and confirm it schedules at 13:00 Europe/Amsterdam (you can temporarily change cron to test).

## Notes
Instagram UI changes frequently. Prefer robust fallback selectors and timeouts. If a selector fails, degrade gracefully and continue.

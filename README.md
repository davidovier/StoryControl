# Instagram Story Capture Agent (Local)

A local automation agent that:
- Logs into Instagram (persistent browser profile)
- Checks a list of Instagram handles
- If a handle has Stories, opens the story viewer and captures screenshots every 3 seconds
- Groups captures into separate “sessions” based on the Story “posted time” label (best-effort)
- Runs once per day at 13:00 Europe/Amsterdam
- Saves screenshots to:
  captures/<handle>/<YYYY-MM-DD>/session_###_<label>/<timestamp>_shot_####.png

> NOTE: Browser automation may trigger Instagram security checks and may violate platform terms. Use only where you have permission and accept that manual re-login may be needed.

## Repo structure (suggested)
- `src/` automation code
- `captures/` output screenshots
- `sessions/` persistent browser profile storage (cookies etc.)
- `handles.txt` one handle per line
- `.env` local secrets (never commit)

## Quick start
1. Install deps:
   - Node.js LTS
   - `npm i`
   - `npx playwright install`

2. Create `.env`:
   - `TZ=Europe/Amsterdam`
   - `IG_USERNAME=...`
   - `IG_PASSWORD=...`

3. Add `handles.txt`

4. Run once:
   - `npm run run:once`

5. Run daily scheduler:
   - `npm run run:scheduler`

## Output layout
Example:
captures/nike/2025-12-19/session_001_1h/2025-12-19T12-00-00-000Z_shot_0001.png

# Requirements (Locked)

## R1. Schedule
- The agent runs **once per day at 13:00** in timezone `Europe/Amsterdam`.
- It must not run more than once per day unless manually invoked.

## R2. Inputs
- A plain text file `handles.txt` at repo root.
- One Instagram handle per line.
- Lines starting with `#` are comments and ignored.
- Empty lines ignored.

## R3. Login
- Agent uses a **persistent browser profile** so login persists across runs.
- First run may require manual completion of IG login or dialogs.
- Credentials are read from `.env`:
  - `IG_USERNAME`
  - `IG_PASSWORD`
- Credentials must never be logged.

## R4. Per-handle behavior
For each handle in `handles.txt`:
1. Navigate to `https://www.instagram.com/<handle>/`
2. If the account has a Story available:
   - Open the Story viewer
   - Capture screenshots every **3 seconds** while Story viewer is open
   - Continue until Story viewer closes (end of all story items) or a safety timeout triggers

## R5. Grouping “multiple story sessions”
User intent: if influencer posted at different times in a day, treat as separate saved folders.
Implementation approach: **best-effort session grouping** based on Story viewer “posted time” label in header (e.g. `1h`, `3h`, `Yesterday`).
- When the label changes during playback, start a **new session folder**.

Limitations:
- Two separate postings can share the same label (e.g. both show `1h`) → might get merged.
- If IG UI hides label, grouping may fall back to `unknown`.

## R6. Storage layout
- Root output folder: `captures/`
- Per handle folder: `captures/<handle>/`
- Per day folder: `captures/<handle>/<YYYY-MM-DD>/`
- Per session folder: `captures/<handle>/<YYYY-MM-DD>/session_<NNN>_<label>/`
- Screenshot filenames must include:
  - ISO timestamp
  - shot index

## R7. Robustness / safety
- Per-handle max runtime safety cap (e.g. 10 minutes) to avoid infinite loops.
- Best-effort close story viewer at end.
- Errors per handle should not stop processing other handles (continue).

## R8. Non-goals
- No database requirement for MVP.
- No cloud deployment; runs locally only.
- No evasion / stealth / captcha solving.

## Acceptance criteria
- If an influencer has stories, screenshots appear in correct folder structure.
- Running on two consecutive days produces separate day folders.
- Changing story “posted time” label creates separate session folders.
- Agent runs automatically at 13:00 Amsterdam time when scheduler is running.

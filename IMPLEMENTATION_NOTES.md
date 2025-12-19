# Implementation Notes (for coding agent)

## Scheduling
- Use node-cron with timezone support:
  - schedule: "0 13 * * *"
  - timezone: "Europe/Amsterdam"
- Also provide a manual entrypoint: `npm run run:once`.

## Detecting story presence
Common patterns:
- Clicking profile avatar opens story viewer if there is a story.
- Heuristic:
  - Click profile image in header area
  - Wait briefly
  - Check if story viewer dialog is open (close button or role="dialog" overlay)

## Detecting “posted time label”
Try in order:
1. `div[role="dialog"] time` innerText
2. `header time` innerText
3. Parse dialog header text for tokens like:
   - `\b\d+\s*[mhd]\b`
   - `Yesterday`, `Today`

Normalize label:
- trim
- remove spaces
- sanitize to filesystem-safe

## When to start a new session folder
- On viewer open: initialize session_001 with current label
- During capture loop: if label changes → sessionIndex++ and create new folder

## Capturing every 3 seconds
- `await page.screenshot({ path, fullPage: false })`
- Sleep 3000ms
- Optional: press ArrowRight to avoid stalls:
  - `page.keyboard.press('ArrowRight')`
  - small delay (150–250ms)

## Ending condition
Stop when:
- viewer is no longer open OR
- safety cap reached

Then best-effort:
- click close button if present
- else Escape

## Error isolation
Wrap per-handle in try/catch:
- log the error (without secrets)
- continue to next handle

## Logging
Log:
- run start/end
- handle start/end
- story found/not found
- session folder created (label)
- number of screenshots captured
Do NOT log:
- credentials
- full cookies/session data

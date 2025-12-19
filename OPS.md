# Ops / Running Locally

## Run modes
- Manual:
  - `npm run run:once`
- Scheduled:
  - `npm run run:scheduler`

## Recommended: keep scheduler running
- macOS: run in Terminal or create a LaunchAgent later
- Linux: run in a tmux session or systemd unit later
- Windows: run in a persistent terminal or Task Scheduler later

## First-run checklist
1. Run `npm run run:once`
2. Complete login manually if prompted (2FA, “Save login info”, etc.)
3. Ensure it reaches at least one profile page
4. Verify `sessions/ig` is created and populated

## Troubleshooting quick tips
- If stories aren’t detected:
  - open IG manually and check if stories appear
  - selectors might need updating (see selectors.md)
- If login loop occurs:
  - delete `sessions/ig` and re-login
- If it stalls in story viewer:
  - increase nudge frequency (ArrowRight)
  - raise safety cap temporarily for debugging

# Security / Privacy

## Secrets
- `.env` must be gitignored.
- Never commit real credentials or API keys.
- Never print `IG_USERNAME`/`IG_PASSWORD` in logs.

## Session storage
- Playwright persistent profile stored under `sessions/ig`.
- This directory contains cookies/session tokens and must be treated as sensitive.
- Add `sessions/` to `.gitignore`.

## Output screenshots
- Screenshots may contain personal data.
- Store locally only (per project scope).
- Consider a retention policy (manual deletion or a future cleanup script).

## Safe usage
- Only monitor accounts you are authorized to access/monitor.
- Expect Instagram to show security prompts; allow manual intervention.

## Explicit non-goals
- No bypassing security, stealth fingerprinting, captcha solving, or similar evasion features.

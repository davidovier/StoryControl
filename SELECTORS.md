# Selectors & Heuristics (Best-effort)

Instagram changes its markup frequently. This file documents the intended selector strategy.

## Story viewer is open
Try:
- close button:
  - `svg[aria-label="Close"]`
  - `button[aria-label="Close"]`
- dialog overlay:
  - `div[role="dialog"]`

Viewer open condition:
- close button exists OR dialog exists

## Open story viewer
Best-effort action:
- click profile image in profile header:
  - `header img` (first)
  - or more specific: avatar container near top (avoid too brittle)

After click:
- wait 1000–1500ms
- check viewer open condition

## Posted time label
Try:
- `div[role="dialog"] time` (first)
- `div[role="dialog"] header time`
- `header time`

Fallback parse:
- get `div[role="dialog"] header` innerText
- match: `(\b\d+\s*[mhd]\b|\bYesterday\b|\bToday\b)`

## Nudge forward
Use keyboard:
- `ArrowRight` occasionally
- `Escape` to close viewer

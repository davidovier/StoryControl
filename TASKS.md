# Build Tasks (Agent Backlog)

## MVP
- [ ] Scaffold Node + Playwright project
- [ ] Add `.gitignore` for `.env`, `sessions/`, `captures/`
- [ ] Implement config + handle loading
- [ ] Implement persistent browser launch
- [ ] Implement login (best effort) + popup dismissal
- [ ] Implement per-handle visit + story open
- [ ] Implement viewer-open detection
- [ ] Implement posted-time label detection
- [ ] Implement grouping into session folders by label changes
- [ ] Implement screenshot loop (every 3s) + safety cap
- [ ] Implement daily scheduler at 13:00 Europe/Amsterdam
- [ ] Add minimal logging and error isolation per handle

## Hardening (optional)
- [ ] Better viewer-open detection (multiple selectors)
- [ ] More robust “posted time” parsing
- [ ] Retry logic for navigation timeouts
- [ ] Local retention cleanup script
- [ ] Optional headless mode flag

## QA
- [ ] Test with 1 handle with no stories
- [ ] Test with 1 handle with multiple postings same day
- [ ] Verify session folder boundaries created on label changes
- [ ] Verify date folders match local Amsterdam date

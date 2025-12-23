# GitHub Actions Setup Guide

This guide walks you through setting up automated story capture using GitHub Actions (free).

## Overview

```
┌─────────────────────────────────────────────────────┐
│               GitHub Actions (Free)                  │
│                                                      │
│  ⏰ Runs daily at 13:00 Amsterdam time              │
│  🎭 Launches Playwright in headless mode            │
│  🔐 Uses encrypted session from GitHub Secrets      │
│  📸 Captures stories → uploads to Supabase          │
│  💾 Updates session secret for next run             │
└─────────────────────────────────────────────────────┘
```

## Step 1: Export Your Instagram Session

First, we need to capture your logged-in session cookies.

```bash
# In the StoryAgent directory
npm run export-session
```

This will:
1. Open a browser window
2. Navigate to Instagram
3. If not logged in, you log in manually (including 2FA if needed)
4. Export your session as a base64 string

**Keep the output - you'll need it for Step 2.**

## Step 2: Create GitHub Secrets

Go to: https://github.com/davidovier/StoryControl/settings/secrets/actions

Click "New repository secret" for each of these:

| Secret Name | Value |
|-------------|-------|
| `IG_USERNAME` | Your Instagram username |
| `IG_PASSWORD` | Your Instagram password |
| `IG_SESSION` | The base64 string from Step 1 |
| `SUPABASE_URL` | `https://stmdoiyfnkecpcrduqoe.supabase.co` |
| `SUPABASE_SECRET_KEY` | Your Supabase secret key |
| `GH_PAT` | A GitHub Personal Access Token (see below) |

### Creating the GH_PAT (Personal Access Token)

The workflow needs to update the `IG_SESSION` secret after each run. For this, you need a PAT:

1. Go to: https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Name: `StoryControl Actions`
4. Expiration: 90 days (or longer)
5. Repository access: Select "Only select repositories" → Choose `StoryControl`
6. Permissions:
   - **Secrets** → Read and write
7. Click "Generate token"
8. Copy the token and save it as `GH_PAT` secret

## Step 3: Enable the Workflow

The workflow is already in `.github/workflows/capture.yml`.

To verify it's working:

1. Go to: https://github.com/davidovier/StoryControl/actions
2. Click "Story Capture" workflow
3. Click "Run workflow" → "Run workflow" (manual trigger)
4. Watch the logs to see it run

## Step 4: Create Supabase Storage Bucket

1. Go to: https://supabase.com/dashboard/project/stmdoiyfnkecpcrduqoe/storage/buckets
2. Click "New bucket"
3. Name: `story-captures`
4. Public: OFF (private)
5. Click "Create bucket"

## Schedule

The workflow runs automatically at:
- **13:00 Amsterdam time** (12:00 UTC in winter, 11:00 UTC in summer)
- Every day

You can also trigger it manually anytime from the Actions tab.

## Troubleshooting

### "Login required" error
Your session may have expired. Run `npm run export-session` again and update the `IG_SESSION` secret.

### "2FA required" error
Instagram is asking for 2FA. You'll need to:
1. Run `npm run export-session` locally
2. Complete 2FA in the browser
3. Update the `IG_SESSION` secret with the new value

### Workflow not running
- Check that the workflow file exists at `.github/workflows/capture.yml`
- Check the Actions tab for any error messages
- Make sure GitHub Actions is enabled for the repository

## Costs

- **GitHub Actions**: Free (2000 minutes/month)
- **Your usage**: ~10 min/day × 30 = 300 minutes/month
- **Total**: $0

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/capture.yml` | GitHub Actions workflow |
| `src/exportSession.js` | Session export script |
| `src/runOnce.js` | Main capture logic |
| `src/instagram.js` | Playwright browser automation |

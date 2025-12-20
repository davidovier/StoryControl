# StoryCheck Email Templates

Beautiful, dark-themed email templates for Supabase Auth.

## How to Install

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/stmdoiyfnkecpcrduqoe/auth/templates)
2. For each template below, copy the HTML content and paste it into the corresponding section

### Templates

| File | Supabase Section |
|------|------------------|
| `confirmation.html` | Confirm signup |
| `recovery.html` | Reset password |
| `magic-link.html` | Magic link |
| `invite.html` | Invite user |
| `email-change.html` | Change email address |

### Subject Lines

Use these subject lines for each email type:

- **Confirm signup**: `Confirm your StoryCheck account`
- **Reset password**: `Reset your StoryCheck password`
- **Magic link**: `Your StoryCheck login link`
- **Invite user**: `You've been invited to StoryCheck`
- **Change email**: `Confirm your new email address`

## Fixing Email Delivery Issues

If emails aren't being delivered:

1. **Check spam folder** - Supabase emails often land in spam
2. **Disable email confirmation** (for testing):
   - Go to Authentication > Providers > Email
   - Turn OFF "Confirm email"
3. **Use custom SMTP** (recommended for production):
   - Go to Project Settings > Auth > SMTP Settings
   - Configure with your own email provider (Resend, SendGrid, etc.)

## Template Variables

These templates use Supabase's template variables:
- `{{ .ConfirmationURL }}` - The confirmation/action link
- `{{ .NewEmail }}` - New email address (for email change)
- `{{ .Token }}` - The raw token (if needed)

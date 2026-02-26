# Email Setup Guide - Send Codes from UBUTABERAhub

## Current Status
✅ Code generation working
✅ Code validation working
⚠️ Email sending: Using Supabase (needs configuration)

## Option 1: Supabase Email (Recommended for Development)

### Pros:
- Already integrated
- Free tier included
- No additional setup needed
- Works immediately

### Cons:
- Limited customization
- Supabase branding in emails
- Rate limits on free tier

### Setup Steps:
1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize the templates with your branding
3. Emails will be sent from: `noreply@mail.app.supabase.io`

**Current Implementation:** Already set up! Emails are sent via Supabase.

---

## Option 2: Custom Email Service (Recommended for Production)

For production, you should use a dedicated email service to send emails from your own domain (e.g., `noreply@ubutaberahub.rw`).

### Best Options:

#### A. Resend (Easiest, Modern)
**Free Tier:** 100 emails/day, 3,000/month
**Cost:** $20/month for 50,000 emails

**Setup:**
1. Go to https://resend.com
2. Sign up and verify your domain
3. Get API key
4. Add to `.env.local`:
   ```
   VITE_RESEND_API_KEY=re_xxxxx
   ```

**Code to add:**
```typescript
// In src/lib/email.ts
export async function sendPasswordResetEmail(email: string, code: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'UBUTABERAhub <noreply@ubutaberahub.rw>',
      to: email,
      subject: 'Password Reset Code - UBUTABERAhub',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>UBUTABERAhub Team</p>
      `,
    }),
  });
  
  return response.json();
}
```

#### B. SendGrid (Popular, Reliable)
**Free Tier:** 100 emails/day forever
**Cost:** $19.95/month for 50,000 emails

**Setup:**
1. Go to https://sendgrid.com
2. Sign up and verify your domain
3. Create API key
4. Similar implementation to Resend

#### C. AWS SES (Cheapest for High Volume)
**Cost:** $0.10 per 1,000 emails
**Setup:** More complex, requires AWS account

---

## Option 3: Custom SMTP (Your Own Email Server)

If you have your own email server or want to use Gmail/Outlook:

**Setup:**
1. Get SMTP credentials
2. Use a library like `nodemailer` (requires backend)
3. Configure SMTP settings

---

## Recommended Implementation Path

### For Development/Testing (Now):
✅ **Use current Supabase implementation**
- Works immediately
- No additional setup
- Good for testing

### For Production (Later):
🎯 **Use Resend or SendGrid**
- Professional emails from your domain
- Better deliverability
- More control over branding
- Detailed analytics

---

## How to Upgrade to Custom Email Service

When you're ready to use a custom email service:

1. **Choose a service** (Resend recommended)
2. **Sign up and verify your domain**
3. **Get API key**
4. **Create email template**
5. **Update `src/lib/auth.ts`:**

```typescript
// Replace the Supabase email sending with:
const response = await fetch('/api/send-reset-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, code }),
});
```

6. **Create backend endpoint** (`/api/send-reset-code`) to send emails

---

## Email Template Example

Here's what the email will look like:

```
From: UBUTABERAhub <noreply@ubutaberahub.rw>
To: user@example.com
Subject: Password Reset Code - UBUTABERAhub

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Password Reset Request

Hello,

You requested to reset your password for your UBUTABERAhub account.

Your verification code is:

    1 2 3 4 5 6

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email 
or contact support if you have concerns.

Best regards,
The UBUTABERAhub Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Current Status Summary

✅ **What's Working:**
- Code generation (6-digit random code)
- Code validation
- Code expiration (10 minutes)
- Email sending via Supabase

⚠️ **What Needs Configuration:**
- Custom domain for emails (optional)
- Email template customization (optional)
- Production email service (for launch)

🎯 **Recommendation:**
Keep current Supabase implementation for now. When you're ready to launch, upgrade to Resend or SendGrid for professional emails from your own domain.

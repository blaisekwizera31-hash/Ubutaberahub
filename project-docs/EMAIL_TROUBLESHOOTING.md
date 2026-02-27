# Email Not Coming - Troubleshooting Guide

## Step 1: Check Supabase Email Confirmation Settings

This is the most common issue!

### Fix: Disable Email Confirmation (For Development)

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project "Ubutaberahub db"

2. **Go to Authentication Settings**
   - Click "Authentication" in left sidebar
   - Click "Providers" tab
   - Scroll down to "Email"

3. **Disable Email Confirmation**
   - Look for "Enable email confirmations"
   - **Toggle it OFF** (disable it)
   - Click "Save"

4. **Check Email Rate Limiting**
   - Still in Authentication settings
   - Look for "Rate Limits"
   - Make sure you haven't hit the limit (3 emails per hour in free tier)

---

## Step 2: Check Supabase Email Logs

Let's see if emails are being sent:

1. **Go to Supabase Dashboard**
2. **Click "Logs" in left sidebar**
3. **Select "Auth Logs"**
4. **Look for recent entries**

**What to look for:**
```
✅ Good: "Password recovery email sent"
❌ Bad: "Rate limit exceeded"
❌ Bad: "Email sending failed"
```

---

## Step 3: Check Your Email Settings

### Check Spam/Junk Folder
- Supabase emails often go to spam
- Check spam folder in your email

### Try Different Email Provider
- Gmail sometimes blocks Supabase emails
- Try with:
  - Outlook/Hotmail
  - ProtonMail
  - Your work email
  - Temporary email (temp-mail.org)

---

## Step 4: Verify User Exists in Supabase Auth

The email will only be sent if the user exists in Supabase Auth (not just your users table).

1. **Go to Supabase Dashboard**
2. **Click "Authentication" → "Users"**
3. **Check if your email is listed**

**If NOT listed:**
- The user doesn't exist in Supabase Auth
- You need to sign up first
- Then try password reset

**If listed:**
- Check the "Email Confirmed" column
- Should show a checkmark ✓

---

## Step 5: Test with Console Logs

Let's add more detailed logging to see what's happening.

### Check Browser Console

When you click "Send Code", check the browser console (F12) for:

```
📧 Sending password reset email to: your@email.com
✅ Password reset email sent (if account exists)
🔐 Demo Code: 123456
```

**If you see errors:**
- Copy the error message
- Check what it says

---

## Step 6: Manual Test via Supabase

Let's test if Supabase can send emails at all:

1. **Go to Supabase Dashboard**
2. **Authentication → Users**
3. **Click on a user**
4. **Click "Send password recovery email"**
5. **Check if email arrives**

**If email arrives:**
- Supabase email works
- Issue is in your code

**If email doesn't arrive:**
- Supabase email service issue
- Need to configure SMTP

---

## Common Issues & Solutions

### Issue 1: "Rate limit exceeded"
**Cause:** Too many emails sent in short time

**Solution:**
- Wait 1 hour
- Or upgrade Supabase plan
- Or set up custom SMTP

### Issue 2: Email goes to spam
**Cause:** Supabase default email has low reputation

**Solution:**
- Check spam folder
- Mark as "Not Spam"
- Or set up custom SMTP with your domain

### Issue 3: "User not found"
**Cause:** User doesn't exist in Supabase Auth

**Solution:**
- Sign up first
- Then try password reset
- Check Authentication → Users in dashboard

### Issue 4: Email confirmation required
**Cause:** Email confirmation is enabled

**Solution:**
- Disable email confirmation (Step 1 above)
- Or confirm email first before reset

### Issue 5: Wrong email address
**Cause:** Typo in email or using different email

**Solution:**
- Double-check email spelling
- Use the exact email you signed up with
- Check Authentication → Users for correct email

---

## Quick Fix: Use Demo Code Only

If emails aren't working, you can still test with the demo code:

1. **Request password reset**
2. **Copy the 6-digit code from the alert**
3. **Enter the code**
4. **Click "Verify"**

This verifies the code works, even if email doesn't arrive.

**Note:** To actually change password, you still need the email link.

---

## Alternative: Temporary Workaround

If you need to reset password urgently without email:

### Option 1: Reset via Supabase Dashboard
1. Go to Supabase Dashboard
2. Authentication → Users
3. Click on the user
4. Click "Reset password"
5. Copy the reset link
6. Paste in browser

### Option 2: Delete and Recreate Account
1. Go to Supabase Dashboard
2. Authentication → Users
3. Delete the user
4. Sign up again with same email

---

## Enable Detailed Logging

Let me update the code to show more details about what's happening.

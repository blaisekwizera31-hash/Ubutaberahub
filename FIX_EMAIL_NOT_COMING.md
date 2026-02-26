# Fix: Email Not Coming - Step by Step

## Most Common Issue: Email Confirmation Enabled

This is why 90% of people don't receive password reset emails!

---

## SOLUTION: Disable Email Confirmation

### Step 1: Go to Supabase Dashboard
```
1. Open: https://app.supabase.com
2. Select your project: "Ubutaberahub db"
```

### Step 2: Go to Authentication Settings
```
1. Click "Authentication" in the left sidebar
2. Click "Providers" at the top
3. Scroll down to find "Email" section
```

### Step 3: Disable Email Confirmation
```
1. Look for "Enable email confirmations"
2. You'll see a toggle switch
3. Turn it OFF (should be gray/disabled)
4. Click "Save" at the bottom
```

**Screenshot locations:**
- Authentication → Providers → Email → Enable email confirmations → OFF

### Step 4: Test Again
```
1. Go back to your app
2. Click "Forgot password?"
3. Enter your email
4. Click "Send Code"
5. Check your email (and spam folder)
```

---

## Still Not Working? Check These:

### Check 1: User Exists in Supabase Auth

```
1. Supabase Dashboard
2. Authentication → Users
3. Look for your email in the list
```

**If NOT there:**
- Sign up first
- Then try password reset

**If there:**
- Continue to next check

### Check 2: Email Rate Limit

```
1. Supabase Dashboard
2. Authentication → Rate Limits
3. Check if you've exceeded limits
```

**Free tier limits:**
- 3 emails per hour per user
- 30 emails per hour total

**If exceeded:**
- Wait 1 hour
- Or upgrade plan

### Check 3: Check Logs

```
1. Supabase Dashboard
2. Logs → Auth Logs
3. Look for recent password reset attempts
```

**Look for:**
- ✅ "Password recovery email sent"
- ❌ "Rate limit exceeded"
- ❌ "Email sending failed"

### Check 4: Spam Folder

```
1. Open your email
2. Check Spam/Junk folder
3. Look for email from: noreply@mail.app.supabase.io
```

**If found in spam:**
- Mark as "Not Spam"
- Try again

### Check 5: Try Different Email

```
1. Use a different email provider
2. Try: Gmail, Outlook, ProtonMail
3. Or use temp-mail.org for testing
```

---

## Check Browser Console

When you click "Send Code", open browser console (F12) and look for:

**Good output:**
```
📧 Sending password reset email to: your@email.com
🔍 Checking Supabase configuration...
📬 Supabase response: { data: null, error: null }
✅ Password reset email sent successfully
📧 Email should arrive within 1-2 minutes
⚠️ Check spam folder if you don't see it
🔐 Demo Code (for testing): 123456
```

**Bad output (rate limit):**
```
❌ Password reset error: Email rate limit exceeded
Error details: { message: "Email rate limit exceeded", status: 429 }
```

**Bad output (user not found):**
```
❌ Password reset error: User not found
```

---

## Quick Test: Manual Email from Supabase

Let's test if Supabase can send emails at all:

### Step 1: Send Test Email
```
1. Supabase Dashboard
2. Authentication → Users
3. Click on your user
4. Click "Send password recovery email" button
5. Wait 1-2 minutes
6. Check email (and spam)
```

**If email arrives:**
- ✅ Supabase email works
- Issue might be in code or settings

**If email doesn't arrive:**
- ❌ Supabase email service issue
- Need to configure SMTP or contact support

---

## Alternative: Use Demo Code Only (Temporary)

While we fix the email issue, you can still test with the demo code:

### How to Use Demo Code:
```
1. Request password reset
2. Copy the 6-digit code from the alert
3. Enter the code in the form
4. Click "Verify"
```

**Note:** This only verifies the code. To actually change the password, you need the email link.

---

## If Nothing Works: Manual Password Reset

### Option 1: Reset via Supabase Dashboard
```
1. Supabase Dashboard
2. Authentication → Users
3. Click on your user
4. Click "..." menu
5. Select "Reset password"
6. Copy the reset link
7. Paste in browser
8. Set new password
```

### Option 2: Update Password Directly
```
1. Supabase Dashboard
2. Authentication → Users
3. Click on your user
4. Click "..." menu
5. Select "Update user"
6. Enter new password
7. Save
```

---

## Most Likely Solution

**99% of the time, the issue is:**

1. ✅ **Email confirmation is enabled** (disable it)
2. ✅ **Email in spam folder** (check spam)
3. ✅ **Rate limit exceeded** (wait 1 hour)
4. ✅ **User doesn't exist** (sign up first)

**Try these in order, and it should work!**

---

## After Fixing

Once emails start working:

1. Test password reset again
2. Check email arrives within 1-2 minutes
3. Click the reset link
4. Set new password
5. Login with new password

---

## Need More Help?

If still not working after trying everything:

1. Share the browser console output
2. Share the Supabase Auth Logs
3. Confirm which steps you've tried
4. I'll help debug further

---

## Summary

**Most common fix:**
1. Go to Supabase Dashboard
2. Authentication → Providers → Email
3. Disable "Enable email confirmations"
4. Save
5. Try again

This fixes 90% of email issues! 🎉

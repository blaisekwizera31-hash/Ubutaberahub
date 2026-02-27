# Fix: Email Logins Are Disabled

## Error Message
```
AuthApiError: Email logins are disabled
```

## Root Cause
Email/password authentication is disabled in your Supabase project settings.

---

## Solution: Enable Email Provider

### Step-by-Step Fix:

#### 1. Go to Supabase Dashboard
```
https://app.supabase.com
→ Select project: "Ubutaberahub db"
```

#### 2. Navigate to Authentication Providers
```
Left Sidebar: Authentication
Top Tabs: Providers
Find: Email (in the providers list)
```

#### 3. Enable Email Provider
```
Click on "Email" to expand settings

Required Settings:
✅ Enable Email provider = ON (toggle should be green)
❌ Enable email confirmations = OFF (toggle should be gray)
✅ Enable email autoconfirm = ON (optional, makes testing easier)
```

#### 4. Save Settings
```
Scroll to bottom
Click "Save" button
Wait for confirmation message
```

#### 5. Test
```
Go back to your app
Try password reset again
Should work now!
```

---

## What Each Setting Does

### Enable Email provider
- **ON**: Users can sign up/login with email and password
- **OFF**: Email authentication is completely disabled
- **You need**: ON

### Enable email confirmations
- **ON**: Users must click email link to confirm account before login
- **OFF**: Users can login immediately after signup
- **You need**: OFF (for easier testing)

### Enable email autoconfirm
- **ON**: Automatically confirms email without requiring click
- **OFF**: Requires manual confirmation
- **You need**: ON (optional, but helpful for testing)

---

## After Enabling

Once you enable email provider:

1. ✅ Signup will work
2. ✅ Login will work
3. ✅ Password reset will work
4. ✅ Email sending will work

---

## Verify It's Enabled

After saving, you should see:

```
Authentication → Providers → Email

Status: Enabled ✓
```

---

## Common Mistakes

### ❌ Wrong: Only enabling email confirmations
- This doesn't enable the email provider
- You need to enable the EMAIL PROVIDER itself

### ❌ Wrong: Leaving email confirmations ON
- This requires users to confirm email before login
- Makes testing harder
- Turn it OFF for development

### ✅ Correct Settings:
```
Enable Email provider: ON
Enable email confirmations: OFF
Enable email autoconfirm: ON (optional)
```

---

## Test After Enabling

### Test 1: Signup
```
1. Go to /auth
2. Click "Create Account"
3. Fill in details
4. Click "Create Account"
5. Should work without errors
```

### Test 2: Login
```
1. Go to /auth
2. Enter email and password
3. Click "Sign In"
4. Should login successfully
```

### Test 3: Password Reset
```
1. Go to /auth
2. Click "Forgot password?"
3. Enter email
4. Click "Send Code"
5. Should send email (check spam folder)
```

---

## Still Having Issues?

If you still see "Email logins are disabled" after enabling:

1. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Wait a minute**
   - Supabase settings take a moment to propagate

3. **Check .env.local**
   - Make sure you have correct Supabase URL and anon key

4. **Restart dev server**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

---

## Summary

**The Fix:**
1. Supabase Dashboard
2. Authentication → Providers → Email
3. Enable Email provider = ON
4. Enable email confirmations = OFF
5. Save
6. Test again

This will fix the "Email logins are disabled" error! 🎉

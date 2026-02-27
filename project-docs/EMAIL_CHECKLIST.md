# Email Not Coming - Quick Checklist ✓

## Do These 5 Things (In Order)

### ☐ 1. Disable Email Confirmation (MOST IMPORTANT!)

**Where:** Supabase Dashboard → Authentication → Providers → Email

**What to do:**
- Find "Enable email confirmations"
- Turn it OFF (toggle should be gray)
- Click "Save"

**Why:** This is the #1 reason emails don't arrive!

---

### ☐ 2. Check Spam Folder

**Where:** Your email inbox → Spam/Junk folder

**What to look for:**
- Email from: noreply@mail.app.supabase.io
- Subject: "Reset Your Password" or similar

**If found:** Mark as "Not Spam"

---

### ☐ 3. Verify User Exists

**Where:** Supabase Dashboard → Authentication → Users

**What to check:**
- Is your email in the list?
- Is "Email Confirmed" checked?

**If not there:** Sign up first, then try reset

---

### ☐ 4. Check Rate Limits

**Where:** Supabase Dashboard → Logs → Auth Logs

**What to look for:**
- "Rate limit exceeded" errors
- Too many requests in short time

**If exceeded:** Wait 1 hour, then try again

---

### ☐ 5. Check Browser Console

**Where:** Press F12 → Console tab

**What to look for when you click "Send Code":**

**Good:**
```
✅ Password reset email sent successfully
📧 Email should arrive within 1-2 minutes
```

**Bad:**
```
❌ Password reset error: [error message]
```

---

## After Checking All 5

### If Email Still Not Coming:

**Try this manual test:**
1. Supabase Dashboard
2. Authentication → Users
3. Click on your user
4. Click "Send password recovery email"
5. Wait 2 minutes
6. Check email + spam

**If this works:** Issue is in the code
**If this doesn't work:** Issue is Supabase email service

---

## Quick Reference

| Issue | Solution |
|-------|----------|
| Email confirmation enabled | Disable in Supabase settings |
| Email in spam | Check spam folder |
| User doesn't exist | Sign up first |
| Rate limit exceeded | Wait 1 hour |
| Wrong email | Use exact signup email |

---

## Most Likely Fix

**90% chance it's this:**

```
Supabase Dashboard
→ Authentication
→ Providers
→ Email
→ "Enable email confirmations" = OFF
→ Save
```

**Try this first!** 🎯

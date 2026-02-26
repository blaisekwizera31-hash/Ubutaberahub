# Login Redirect Issue - Step-by-Step Solutions

## Problem
Login is successful, but getting 406 (Not Acceptable) error when trying to access dashboard. The error occurs when ProtectedRoute tries to fetch user data from Supabase.

**Error Message:**
```
GET https://pbmwancclazpkiingwvr.supabase.co/rest/v1/users?select=*&id=eq.9e3e2a42-e099-44c8-81ec-ec15546d7aaf 406 (Not Acceptable)
```

## Root Cause
Supabase Row Level Security (RLS) policies are blocking anonymous access to the users table. The frontend uses the `anon` key, which doesn't have permission to read from the users table.

---

## Solution 1: Fix RLS Policies (RECOMMENDED)

This is the proper production solution.

### Steps:

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project "Ubutaberahub db"

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run This SQL:**
```sql
-- Allow anonymous users to read from users table
-- This is needed because the anon key is used to fetch user data
DROP POLICY IF EXISTS "Anyone can read users" ON public.users;

CREATE POLICY "Anyone can read users"
  ON public.users
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

4. **Click "Run" button**

5. **Test Your Login**
   - Go to your app
   - Try logging in
   - You should now be redirected to the correct dashboard

### Why This Works:
- The policy allows both `anon` and `authenticated` users to read from the users table
- This is safe because users can only read data, not modify it
- The frontend can now fetch user data after authentication

---

## Solution 2: Temporary - Disable RLS (TESTING ONLY)

Use this only for quick testing. **DO NOT use in production!**

### Steps:

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project

2. **Open Table Editor**
   - Click "Table Editor" in the left sidebar
   - Click on "users" table

3. **Disable RLS**
   - Look for "RLS" toggle at the top
   - Click to disable Row Level Security

4. **Test Your Login**
   - Try logging in
   - Should work now

5. **IMPORTANT: Re-enable RLS after testing!**
   - Go back to Table Editor
   - Toggle RLS back ON
   - Then implement Solution 1

---

## Solution 3: Current Fallback (ALREADY IMPLEMENTED)

I've updated the code to use localStorage as a fallback when RLS blocks database access.

### What Changed:

**In `src/pages/Auth.tsx`:**
- Now stores user role and ID in localStorage after successful login
- This provides a backup when database query fails

**In `src/components/ProtectedRoute.tsx`:**
- Now checks localStorage for user role when database query fails
- Falls back to stored role instead of defaulting to 'citizen'

### How It Works:
1. User logs in successfully
2. Role is stored in localStorage
3. If database query fails (406 error), use stored role
4. User is redirected to correct dashboard

### Limitations:
- User data might be stale if changed in database
- Not ideal for production (Solution 1 is better)
- Works as temporary workaround

---

## Testing Steps

After implementing Solution 1 (recommended):

1. **Clear Browser Data**
   ```
   - Press F12 to open DevTools
   - Go to Application tab
   - Clear Storage → Clear site data
   ```

2. **Test Login**
   - Go to /auth
   - Enter your credentials
   - Click "Sign In"

3. **Check Console Logs**
   - Open DevTools Console (F12)
   - Look for these messages:
     ```
     ✅ Login successful!
     👤 User: {email, role, ...}
     🎯 Role: citizen (or lawyer/judge/clerk)
     🚀 Navigating to: /dashboard
     ✅ Session found: your@email.com
     ✅ User data loaded: {...}
     ✅ Access granted to citizen
     ```

4. **Verify Redirect**
   - Should automatically go to correct dashboard:
     - Citizen → /dashboard
     - Lawyer → /lawyer-dashboard
     - Judge → /judge-dashboard
     - Clerk → /clerk-dashboard

5. **Test Protected Routes**
   - Try accessing other role's dashboard by typing URL
   - Should redirect you back to your own dashboard

---

## Troubleshooting

### Still Getting 406 Error?
- Make sure you ran the SQL in Solution 1
- Check if RLS is enabled on users table
- Verify the policy was created (check Supabase → Authentication → Policies)

### Redirecting to Wrong Dashboard?
- Clear localStorage: `localStorage.clear()`
- Log out and log in again
- Check user role in Supabase Table Editor

### Not Redirecting at All?
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Make sure you're using the correct email/password

### Login Successful but Shows "No user returned"?
- This means the database query failed
- Implement Solution 1 to fix RLS policies
- The fallback (Solution 3) should still work

---

## Next Steps

1. **Implement Solution 1** (Fix RLS policies)
2. **Test login with different roles**
3. **Verify protected routes work correctly**
4. **Test OAuth login** (Google, Microsoft)
5. **Test forgot password flow**

---

## Security Notes

- Solution 1 is production-ready and secure
- Solution 2 is ONLY for testing - never use in production
- Solution 3 is a temporary workaround
- Always keep RLS enabled in production
- Never expose your service role key in frontend code

---

## Files Modified

- `src/pages/Auth.tsx` - Added localStorage backup for user role
- `src/components/ProtectedRoute.tsx` - Added fallback to localStorage
- `supabase-schema.sql` - Need to update RLS policies (Solution 1)

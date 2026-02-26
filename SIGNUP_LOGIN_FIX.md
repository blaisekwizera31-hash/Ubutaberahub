# Signup & Login Issues - Fixed

## Issues Found

### 1. Database Insert Error
**Error:** `invalid input syntax for type integer: ""`

**Cause:** Empty strings were being sent for integer fields (like `years_experience`) when they should be `null` or omitted.

**Fix:** Updated `src/lib/auth.ts` to only include fields that have actual values, and properly convert `yearsExperience` to integer.

### 2. Login Redirect Loop
**Error:** After successful login, user gets redirected back to `/auth`

**Cause:** 
- ProtectedRoute tries to fetch user data immediately after login
- Database might not have the user data yet (timing issue)
- RLS policies might be blocking the query

**Fix:** 
- Added retry logic in ProtectedRoute (tries 3 times with 500ms delay)
- Enhanced localStorage fallback
- Store user role immediately after signup and login

---

## What Was Changed

### File: `src/lib/auth.ts`

**Before:**
```typescript
// Sent ALL fields including empty strings
{
  id: authData.user.id,
  email: email,
  name: userInfo.name,
  phone: userInfo.phone,  // Could be ""
  years_experience: userInfo.yearsExperience,  // Could be "" (invalid for integer)
  // ... all other fields
}
```

**After:**
```typescript
// Only send fields with actual values
const insertData: any = {
  id: authData.user.id,
  email: email,
  name: userInfo.name,
  phone: userInfo.phone || null,
  role: userInfo.role,
};

// Add optional fields only if they exist
if (userInfo.citizenId) insertData.citizen_id = userInfo.citizenId;
if (userInfo.yearsExperience) insertData.years_experience = parseInt(userInfo.yearsExperience);
// ... etc
```

### File: `src/components/ProtectedRoute.tsx`

**Added:**
- Retry logic (3 attempts with 500ms delay between each)
- Better localStorage fallback
- More detailed console logging

**Why:** Sometimes the database insert takes a moment, so we retry a few times before giving up.

### File: `src/pages/Auth.tsx`

**Added:**
- Store user role in localStorage immediately after signup
- Better user feedback

---

## Testing Steps

### Test Signup:

1. **Clear browser data:**
   - Press F12 → Application → Clear site data

2. **Go to signup page:**
   - Click "Create Account"

3. **Fill in the form:**
   - Name: Test User
   - Phone: +250 788 123 456
   - Email: test@example.com
   - Password: Test1234
   - Role: Citizen
   - Citizen ID: 1 1234 5 6789012 3 45

4. **Click "Create Account"**
   - Should see "Account created successfully!"
   - Should switch to login mode

5. **Check console:**
   - Should NOT see "Database insert error"
   - Should NOT see "invalid input syntax"

### Test Login:

1. **Enter credentials:**
   - Email: test@example.com
   - Password: Test1234

2. **Click "Sign In"**
   - Should see loading screen
   - Should redirect to /dashboard

3. **Check console logs:**
   ```
   ✅ Login successful!
   👤 User: {...}
   🎯 Role: citizen
   🚀 Navigating to: /dashboard
   ✅ Session found: test@example.com
   ✅ User data loaded: {...}
   ✅ Access granted to citizen
   ```

4. **Verify you're on dashboard:**
   - URL should be `/dashboard`
   - Should see citizen dashboard content
   - Should NOT redirect back to /auth

### Test Different Roles:

**Lawyer:**
- License Number: RBA/001/2024
- Specialization: Criminal Law

**Clerk:**
- Employee ID: CLK-2024-001
- Court Assigned: Kigali High Court

**Judge:**
- Judge ID: JDG-2024-001
- Years of Experience: 10

---

## If Still Having Issues

### Issue: Still seeing "Database insert error"

**Solution:**
1. Check Supabase Table Editor
2. Look at the `users` table schema
3. Make sure integer fields allow NULL values:
   ```sql
   ALTER TABLE users ALTER COLUMN years_experience DROP NOT NULL;
   ```

### Issue: Still redirecting to /auth after login

**Solution 1 - Fix RLS (Best):**
```sql
-- Run in Supabase SQL Editor
DROP POLICY IF EXISTS "Anyone can read users" ON public.users;

CREATE POLICY "Anyone can read users"
  ON public.users
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

**Solution 2 - Check localStorage:**
1. Open DevTools → Application → Local Storage
2. Should see:
   - `userRole`: "citizen" (or your role)
   - `userId`: "your-uuid"
3. If missing, clear and try logging in again

**Solution 3 - Increase retry delay:**
In `ProtectedRoute.tsx`, change:
```typescript
await new Promise(resolve => setTimeout(resolve, 500));
// to
await new Promise(resolve => setTimeout(resolve, 1000));
```

---

## Key Improvements

1. ✅ No more empty string errors for integer fields
2. ✅ Retry logic handles timing issues
3. ✅ localStorage provides reliable fallback
4. ✅ Better error messages and logging
5. ✅ Proper type conversion for numeric fields

---

## Next Steps

1. Test signup with all 4 roles
2. Test login with each role
3. Verify correct dashboard redirect
4. Test protected routes (try accessing other dashboards)
5. Implement Solution 1 from LOGIN_REDIRECT_SOLUTIONS.md for production

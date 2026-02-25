# Backend Setup Guide - UBUTABERAhub

## Step-by-Step Instructions

### 1. Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project" and sign up
3. Create a new project:
   - Name: `Ubutaberahub db`
   - Database Password: (create and save securely)
   - Region: Europe West (closest to Rwanda)
   - Plan: Free tier

### 2. Get Your Credentials
1. Once project is created, go to **Project Settings** (gear icon)
2. Click **API** in the left menu
3. Copy these values:
   - **Project URL**: `https://pbmwancclazpkiingwvr.supabase.co`
   - **anon public key**: `eyJ...` (long string)

### 3. Configure Environment Variables
1. Open `.env.local` file in your project root
2. Replace the placeholder values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```
3. Save the file

### 4. Create Database Tables
1. In Supabase dashboard, click **SQL Editor** in left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste into the SQL editor
5. Click **Run** button
6. You should see "Success. No rows returned"

### 5. Enable OAuth Providers (Optional - for Google/Microsoft/Apple login)

#### Google OAuth:
1. In Supabase: **Authentication** → **Providers** → **Google**
2. Toggle "Enable Sign in with Google"
3. Go to https://console.cloud.google.com
4. Create OAuth credentials
5. Copy Client ID and Client Secret to Supabase
6. Add redirect URL from Supabase to Google Console

#### Microsoft OAuth:
1. In Supabase: **Authentication** → **Providers** → **Azure**
2. Toggle "Enable Sign in with Azure"
3. Go to https://portal.azure.com
4. Register application
5. Copy Application ID and Secret to Supabase

#### Apple OAuth:
1. In Supabase: **Authentication** → **Providers** → **Apple**
2. Toggle "Enable Sign in with Apple"
3. Go to https://developer.apple.com
4. Create Service ID
5. Copy credentials to Supabase

### 6. Test Your Setup
1. Restart your development server: `npm run dev`
2. The app should now connect to Supabase
3. Try registering a new user
4. Check Supabase dashboard → **Authentication** → **Users** to see registered users

## Verification Checklist
- [ ] Supabase project created
- [ ] `.env.local` file configured with correct credentials
- [ ] Database schema executed successfully
- [ ] Tables visible in Supabase **Table Editor**
- [ ] Development server restarted
- [ ] OAuth providers configured (if using social login)

## Troubleshooting

### "Invalid API key" error
- Check that you copied the **anon public** key, not the service role key
- Ensure no extra spaces in `.env.local`
- Restart dev server after changing `.env.local`

### "relation does not exist" error
- Run the SQL schema again in Supabase SQL Editor
- Check that tables were created in **Table Editor**

### OAuth not working
- Verify redirect URLs match exactly
- Check that provider is enabled in Supabase
- Ensure credentials are correct

## Next Steps
Once setup is complete, we'll:
1. Integrate authentication into the Auth page
2. Implement login/signup functionality
3. Add OAuth social login
4. Create protected routes
5. Add user session management

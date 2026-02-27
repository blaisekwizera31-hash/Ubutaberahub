# OAuth Setup Guide - Google, Microsoft, Apple

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Name: `UBUTABERAhub`
4. Click **Create**

### Step 2: Enable Google+ API
1. In the left menu, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure consent screen:
   - User Type: **External**
   - App name: `UBUTABERAhub`
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all steps
4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: `UBUTABERAhub Web`
   - Authorized redirect URIs: Paste your Supabase callback URL
   - Click **Create**
5. **Copy the Client ID and Client Secret**

### Step 4: Add to Supabase
1. Go back to Supabase → Authentication → Providers → Google
2. Paste **Client ID**
3. Paste **Client Secret**
4. Click **Save**

---

## 2. Microsoft (Azure) OAuth Setup

### Step 1: Register Application
1. Go to https://portal.azure.com
2. Search for **Azure Active Directory** (or **Microsoft Entra ID**)
3. Click **App registrations** in left menu
4. Click **+ New registration**
5. Fill in:
   - Name: `UBUTABERAhub`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: **Web** → Paste your Supabase callback URL
6. Click **Register**

### Step 2: Get Application ID
1. You'll see **Application (client) ID** - **Copy this**
2. This is your Client ID for Supabase

### Step 3: Create Client Secret
1. In left menu, click **Certificates & secrets**
2. Click **+ New client secret**
3. Description: `UBUTABERAhub Secret`
4. Expires: Choose duration (24 months recommended)
5. Click **Add**
6. **Copy the Value immediately** (you can't see it again!)

### Step 4: Add to Supabase
1. Go back to Supabase → Authentication → Providers → Azure
2. Paste **Application (client) ID** as Client ID
3. Paste **Client Secret Value**
4. Azure Tenant: Leave as `common` (for personal + work accounts)
5. Click **Save**

---

## 3. Apple OAuth Setup

### Step 1: Apple Developer Account Required
⚠️ **Note:** Apple OAuth requires:
- Apple Developer Account ($99/year)
- Verified domain
- More complex setup

### For Development/Testing:
You can skip Apple for now and add it later when you're ready to deploy.

### If You Want to Set It Up Now:
1. Go to https://developer.apple.com
2. Sign in with Apple ID
3. Go to **Certificates, Identifiers & Profiles**
4. Create **App ID**
5. Create **Services ID**
6. Configure Sign in with Apple
7. Get credentials and add to Supabase

**Recommendation:** Skip Apple for now, focus on Google and Microsoft first.

---

## Testing OAuth

Once you've configured Google and/or Microsoft:

1. Go to your app's Auth page
2. Click the Google or Microsoft button
3. You should be redirected to the provider's login page
4. Sign in with your account
5. You'll be redirected back to your app

If it works, you're done! If not, check:
- Callback URLs match exactly
- Credentials are correct
- Provider is enabled in Supabase

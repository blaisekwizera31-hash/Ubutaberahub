# OAuth Setup Guide

This application supports social login with Google, Microsoft, and Apple. Follow these steps to configure OAuth for production.

## Current Status
✅ Frontend OAuth flow is configured and will redirect to provider login pages
✅ Callback handler is set up at `/auth/callback`
⚠️ You need to replace placeholder client IDs with real credentials

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:5173/auth/callback` (development)
7. For production, add: `https://yourdomain.com/auth/callback`
8. Copy the Client ID
9. Replace `YOUR_GOOGLE_CLIENT_ID` in `src/pages/Auth.tsx` with your actual Client ID

### 2. Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Add redirect URI: `http://localhost:5173/auth/callback`
5. Go to "Certificates & secrets" → Create a client secret (for backend)
6. Copy the Application (client) ID
7. Replace `YOUR_MICROSOFT_CLIENT_ID` in `src/pages/Auth.tsx`

### 3. Apple OAuth Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new "Services ID"
4. Configure "Sign in with Apple"
5. Add return URL: `http://localhost:5173/auth/callback`
6. Copy the Services ID
7. Replace `YOUR_APPLE_CLIENT_ID` in `src/pages/Auth.tsx`

## Backend Integration Required

The current implementation redirects to OAuth providers and receives the authorization code. You need to:

1. **Create a backend endpoint** (e.g., `/api/auth/oauth/callback`)
2. **Exchange authorization code for access token**
3. **Fetch user profile from provider**
4. **Create/update user in your database**
5. **Return JWT or session token to frontend**

### Example Backend Flow (Node.js/Express)

```javascript
app.post('/api/auth/oauth/callback', async (req, res) => {
  const { code, provider } = req.body;
  
  // Exchange code for access token
  const tokenResponse = await fetch(providerTokenUrl, {
    method: 'POST',
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });
  
  const { access_token } = await tokenResponse.json();
  
  // Fetch user info
  const userInfo = await fetch(providerUserInfoUrl, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  
  const userData = await userInfo.json();
  
  // Create/update user in database
  const user = await createOrUpdateUser(userData);
  
  // Generate JWT
  const token = generateJWT(user);
  
  res.json({ token, user });
});
```

## Security Notes

- Never expose client secrets in frontend code
- Use HTTPS in production
- Implement CSRF protection
- Validate state parameter to prevent CSRF attacks
- Store tokens securely (httpOnly cookies recommended)

## Testing

For development/testing, the app currently uses a mock OAuth flow that simulates successful login without requiring real OAuth credentials.

To test with real OAuth:
1. Set up credentials as described above
2. Replace the placeholder client IDs
3. Implement the backend callback handler
4. Update `src/pages/AuthCallback.tsx` to call your backend API

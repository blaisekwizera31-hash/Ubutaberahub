# Custom Email Setup for UBUTABERAhub

## Goal
Send password reset emails from UBUTABERAhub with your logo and branding.

---

## Step 1: Customize Email Template in Supabase

### 1.1 Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your project "Ubutaberahub db"
3. Click **Authentication** in the left sidebar
4. Click **Email Templates**

### 1.2 Select "Reset Password" Template
1. You'll see several templates:
   - Confirm signup
   - Invite user
   - Magic Link
   - **Reset Password** ← Select this one
   - Email Change

### 1.3 Customize the Template

Replace the default template with this branded version:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - UBUTABERAhub</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #000000;
      padding: 30px 40px;
      text-align: center;
    }
    .logo {
      max-width: 200px;
      height: auto;
    }
    .content {
      padding: 40px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #000000;
      margin: 0 0 20px 0;
    }
    .text {
      font-size: 16px;
      color: #333333;
      margin: 0 0 20px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #333333;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e5e5e5;
    }
    .footer-text {
      font-size: 14px;
      color: #666666;
      margin: 5px 0;
    }
    .divider {
      height: 1px;
      background-color: #e5e5e5;
      margin: 30px 0;
    }
    .security-note {
      background-color: #f9f9f9;
      border-left: 4px solid #000000;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
      color: #666666;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header with Logo -->
    <div class="header">
      <img src="https://your-domain.com/logo.png" alt="UBUTABERAhub" class="logo">
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <h1 class="title">Reset Your Password</h1>
      
      <p class="text">Hello,</p>
      
      <p class="text">
        We received a request to reset the password for your UBUTABERAhub account. 
        Click the button below to create a new password:
      </p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
      </div>
      
      <p class="text" style="font-size: 14px; color: #666;">
        Or copy and paste this link into your browser:<br>
        <a href="{{ .ConfirmationURL }}" style="color: #000000; word-break: break-all;">{{ .ConfirmationURL }}</a>
      </p>
      
      <div class="security-note">
        <strong>Security Note:</strong> This link will expire in 1 hour. 
        If you didn't request a password reset, you can safely ignore this email.
      </div>
      
      <div class="divider"></div>
      
      <p class="text" style="font-size: 14px; color: #666;">
        Need help? Contact our support team at support@ubutaberahub.rw
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        <strong>UBUTABERA<span style="color: #000000;">hub</span></strong>
      </p>
      <p class="footer-text">
        Rwanda's Digital Justice Platform
      </p>
      <p class="footer-text" style="margin-top: 15px;">
        © 2024 UBUTABERAhub. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
```

### 1.4 Important: Update Logo URL

In the template above, replace:
```html
<img src="https://your-domain.com/logo.png" alt="UBUTABERAhub" class="logo">
```

With one of these options:

**Option A: Use a public URL (Recommended)**
```html
<img src="https://your-deployed-app.com/logow.png" alt="UBUTABERAhub" class="logo">
```

**Option B: Use a CDN or image hosting**
- Upload your logo to Imgur, Cloudinary, or similar
- Use that URL

**Option C: Use base64 encoded image (works offline)**
```html
<img src="data:image/png;base64,iVBORw0KG..." alt="UBUTABERAhub" class="logo">
```

### 1.5 Save the Template
Click **Save** at the bottom of the page.

---

## Step 2: Set Up Custom SMTP (Optional but Recommended)

To send emails from your own domain (e.g., noreply@ubutaberahub.rw):

### 2.1 Choose an Email Service

**Recommended Services:**

1. **Resend** (Easiest, Modern)
   - Website: https://resend.com
   - Free tier: 3,000 emails/month
   - Easy setup
   - Great for developers

2. **SendGrid** (Popular)
   - Website: https://sendgrid.com
   - Free tier: 100 emails/day
   - Reliable
   - Good documentation

3. **AWS SES** (Cheapest for scale)
   - Website: https://aws.amazon.com/ses/
   - $0.10 per 1,000 emails
   - Requires AWS account
   - More complex setup

### 2.2 Setup with Resend (Recommended)

#### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up for free account
3. Verify your email

#### Step 2: Add Your Domain
1. Click **Domains** in sidebar
2. Click **Add Domain**
3. Enter your domain: `ubutaberahub.rw`
4. Follow DNS setup instructions:
   - Add SPF record
   - Add DKIM record
   - Add DMARC record (optional)

#### Step 3: Get SMTP Credentials
1. Click **API Keys** in sidebar
2. Click **Create API Key**
3. Name it: "Supabase Email"
4. Copy the API key (save it securely!)

#### Step 4: Configure Supabase SMTP
1. Go to Supabase Dashboard
2. **Project Settings** → **Auth** → **SMTP Settings**
3. Enable **Enable Custom SMTP**
4. Fill in:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Your Resend API Key]
   Sender email: noreply@ubutaberahub.rw
   Sender name: UBUTABERAhub
   ```
5. Click **Save**

#### Step 5: Test
1. Go back to your app
2. Try password reset
3. Check email - should come from noreply@ubutaberahub.rw

---

## Step 3: Customize Other Email Templates

While you're in Supabase Email Templates, customize these too:

### Confirm Signup Email
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to UBUTABERAhub</title>
  <!-- Same styles as above -->
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://your-domain.com/logow.png" alt="UBUTABERAhub" class="logo">
    </div>
    
    <div class="content">
      <h1 class="title">Welcome to UBUTABERAhub!</h1>
      
      <p class="text">Hello,</p>
      
      <p class="text">
        Thank you for creating an account with UBUTABERAhub, Rwanda's Digital Justice Platform.
      </p>
      
      <p class="text">
        To complete your registration, please confirm your email address by clicking the button below:
      </p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirm Email</a>
      </div>
      
      <p class="text" style="font-size: 14px; color: #666;">
        Or copy and paste this link:<br>
        <a href="{{ .ConfirmationURL }}" style="color: #000000;">{{ .ConfirmationURL }}</a>
      </p>
      
      <div class="divider"></div>
      
      <p class="text">
        Once confirmed, you can:
      </p>
      <ul style="color: #333; font-size: 16px;">
        <li>Submit and track legal cases</li>
        <li>Find qualified lawyers</li>
        <li>Access legal resources</li>
        <li>Communicate securely with legal professionals</li>
      </ul>
      
      <p class="text" style="font-size: 14px; color: #666;">
        Need help? Contact us at support@ubutaberahub.rw
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">
        <strong>UBUTABERA<span style="color: #000000;">hub</span></strong>
      </p>
      <p class="footer-text">Rwanda's Digital Justice Platform</p>
      <p class="footer-text">© 2024 UBUTABERAhub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### Magic Link Email
```html
<!-- Similar structure, but with "Sign In" button and different messaging -->
```

---

## Step 4: Upload Logo to Public Location

### Option A: Deploy Your App First
1. Deploy your app to Vercel/Netlify/etc.
2. Your logo will be at: `https://your-app.vercel.app/logow.png`
3. Use this URL in email templates

### Option B: Use Image Hosting (Quick Solution)

#### Using Imgur:
1. Go to https://imgur.com
2. Click **New post**
3. Upload `public/logow.png`
4. Right-click the image → **Copy image address**
5. Use this URL in email template

#### Using Cloudinary:
1. Sign up at https://cloudinary.com
2. Upload your logo
3. Copy the public URL
4. Use in email template

### Option C: Convert to Base64 (Works Offline)

Run this command in your project:
```bash
# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("public/logow.png"))

# On Mac/Linux
base64 public/logow.png
```

Then use in email:
```html
<img src="data:image/png;base64,[paste-base64-here]" alt="UBUTABERAhub">
```

---

## Step 5: Test Your Custom Emails

### Test Password Reset:
1. Go to your app
2. Click "Forgot password?"
3. Enter your email
4. Check inbox
5. Verify:
   - ✅ Email from noreply@ubutaberahub.rw (if SMTP configured)
   - ✅ UBUTABERAhub logo appears
   - ✅ Black and white branding
   - ✅ Reset button works

### Test Signup Confirmation:
1. Create a new account
2. Check email
3. Verify branding and logo

---

## Quick Start (Without Custom Domain)

If you want to test immediately without setting up SMTP:

1. **Just customize the email template** (Step 1)
2. **Use a public image URL** for the logo
3. Emails will come from Supabase but look branded
4. Set up custom SMTP later when you have a domain

---

## Troubleshooting

### Logo Not Showing?
- Check if image URL is publicly accessible
- Try opening the URL in incognito browser
- Make sure it's HTTPS, not HTTP
- Try base64 encoding instead

### Email Going to Spam?
- Set up SPF, DKIM, DMARC records
- Use custom SMTP with verified domain
- Avoid spam trigger words
- Include unsubscribe link (for marketing emails)

### SMTP Not Working?
- Double-check credentials
- Verify domain is verified in email service
- Check Supabase logs for errors
- Try port 465 instead of 587

### Template Not Updating?
- Clear browser cache
- Wait a few minutes
- Check if you saved the template
- Try in incognito mode

---

## Cost Breakdown

### Free Tier (Good for Testing):
- Supabase: Free (50,000 monthly active users)
- Resend: Free (3,000 emails/month)
- Total: $0/month

### Paid Tier (Production):
- Supabase Pro: $25/month
- Resend Pro: $20/month (50,000 emails)
- Domain: ~$15/year
- Total: ~$46/month

---

## Next Steps

1. ✅ Customize email template in Supabase
2. ⏳ Upload logo to public location
3. ⏳ Update logo URL in template
4. ⏳ Test password reset email
5. ⏳ Sign up for Resend account
6. ⏳ Configure custom SMTP
7. ⏳ Verify domain
8. ⏳ Test with custom domain
9. ⏳ Customize other email templates

---

## Support

Need help? Check:
- Supabase Docs: https://supabase.com/docs/guides/auth/auth-smtp
- Resend Docs: https://resend.com/docs/send-with-supabase
- Email Template Variables: https://supabase.com/docs/guides/auth/auth-email-templates

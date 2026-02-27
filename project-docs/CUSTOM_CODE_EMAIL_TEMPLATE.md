# Custom Email Template with Code - UBUTABERAhub

## Goal
Send password reset emails with a 6-digit code (not magic link) from UBUTABERAhub with your logo.

---

## Step 1: Customize Email Template in Supabase

### 1.1 Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your project "Ubutaberahub db"
3. Click **Authentication** in the left sidebar
4. Click **Email Templates**

### 1.2 Select "Magic Link" Template
Since we're using OTP (One-Time Password), we need to customize the "Magic Link" template.

1. Click on **"Magic Link"** template
2. Replace the entire content with the template below

### 1.3 Custom Email Template with Code

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code - UBUTABERAhub</title>
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
    .code-container {
      background-color: #f9f9f9;
      border: 2px solid #000000;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      color: #666666;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .code {
      font-size: 48px;
      font-weight: 700;
      color: #000000;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
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
      background-color: #fff9e6;
      border-left: 4px solid #000000;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
      color: #666666;
    }
    .steps {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .step-number {
      background-color: #000000;
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .step-text {
      font-size: 14px;
      color: #333333;
      padding-top: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header with Logo -->
    <div class="header">
      <img src="https://your-domain.com/logow.png" alt="UBUTABERAhub" class="logo">
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <h1 class="title">Password Reset Code</h1>
      
      <p class="text">Hello,</p>
      
      <p class="text">
        We received a request to reset the password for your UBUTABERAhub account. 
        Use the code below to complete your password reset:
      </p>
      
      <!-- Code Display -->
      <div class="code-container">
        <div class="code-label">Your Reset Code</div>
        <div class="code">{{ .Token }}</div>
      </div>
      
      <!-- Instructions -->
      <div class="steps">
        <p class="text" style="margin-bottom: 15px; font-weight: 600;">How to reset your password:</p>
        
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">Go back to the UBUTABERAhub password reset page</div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">Enter the 6-digit code shown above</div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">Create your new password</div>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-text">Sign in with your new password</div>
        </div>
      </div>
      
      <div class="security-note">
        <strong>⚠️ Security Note:</strong> This code will expire in 10 minutes. 
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

### 1.4 Update Logo URL

Replace this line in the template:
```html
<img src="https://your-domain.com/logow.png" alt="UBUTABERAhub" class="logo">
```

With your actual logo URL (see LOGO_UPLOAD_GUIDE.md for how to get this).

### 1.5 Save the Template
Click **Save** at the bottom of the page.

---

## Step 2: How the Code is Sent

The code is automatically included in the email via the `{{ .Token }}` variable.

When you call `supabase.auth.signInWithOtp()`, Supabase:
1. Generates a 6-digit code
2. Sends it to the email template
3. Replaces `{{ .Token }}` with the actual code
4. Sends the email

---

## Step 3: Test the Email

### Test Flow:
1. Go to your app
2. Click "Forgot password?"
3. Enter your email
4. Click "Send Code"
5. Check your email (and spam folder)

### What You Should See:
- Email from: noreply@mail.app.supabase.io (or your custom domain)
- Subject: "Password Reset Code" or similar
- UBUTABERAhub logo at the top
- Large 6-digit code in the middle
- Step-by-step instructions
- Black and white branding

---

## Step 4: Complete Password Reset

### User Flow:
1. User receives email with code
2. User enters code in your app
3. User enters new password
4. Password is updated
5. User can login with new password

### In Your App:
1. Enter the 6-digit code from email
2. Enter new password
3. Confirm new password
4. Click "Reset Password"
5. Success! Login with new password

---

## Customization Options

### Change Code Display Style:
```css
.code {
  font-size: 48px;        /* Make code bigger/smaller */
  color: #000000;         /* Change code color */
  letter-spacing: 8px;    /* Space between digits */
}
```

### Change Colors:
```css
.header {
  background-color: #000000;  /* Header background */
}

.code-container {
  border: 2px solid #000000;  /* Code box border */
}
```

### Add More Branding:
- Add your company address in footer
- Add social media links
- Add support phone number
- Add website link

---

## For Production: Custom SMTP

To send emails from your own domain (e.g., noreply@ubutaberahub.rw):

### Option 1: Resend (Recommended)
1. Sign up at https://resend.com
2. Add your domain
3. Get SMTP credentials
4. Configure in Supabase (see CUSTOM_EMAIL_SETUP.md)

### Option 2: SendGrid
1. Sign up at https://sendgrid.com
2. Verify your domain
3. Get API key
4. Configure in Supabase

### Option 3: AWS SES
1. Set up AWS account
2. Verify domain in SES
3. Get SMTP credentials
4. Configure in Supabase

---

## Troubleshooting

### Code Not Showing in Email?
- Make sure you're using `{{ .Token }}` in the template
- Check you're editing the "Magic Link" template
- Save the template after editing

### Email Not Arriving?
- Check spam folder
- Verify email provider is enabled
- Check Supabase Auth Logs
- Verify rate limits not exceeded

### Code Not Working?
- Code expires in 10 minutes
- Make sure email matches
- Check code is entered correctly (no spaces)
- Try requesting a new code

---

## Summary

**What You Get:**
- ✅ Email with 6-digit code (not magic link)
- ✅ UBUTABERAhub branding
- ✅ Your logo in email
- ✅ Black and white design
- ✅ Step-by-step instructions
- ✅ Professional appearance
- ✅ Mobile responsive

**User Experience:**
1. User requests password reset
2. Receives email with code
3. Enters code in app
4. Sets new password
5. Done!

No magic links, no redirects - just a simple code! 🎉
